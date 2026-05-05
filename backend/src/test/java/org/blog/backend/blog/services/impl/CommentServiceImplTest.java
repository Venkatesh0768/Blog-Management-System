package org.blog.backend.blog.services.impl;

import org.blog.backend.auth.exception.UserNotFoundException;
import org.blog.backend.auth.model.User;
import org.blog.backend.auth.repository.UserRepository;
import org.blog.backend.blog.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.blog.dto.commentsDto.commentResponseDtos.CommentResponseDto;
import org.blog.backend.blog.exception.PostNotFoundException;
import org.blog.backend.blog.model.Comment;
import org.blog.backend.blog.model.Post;
import org.blog.backend.blog.model.PostStatus;
import org.blog.backend.blog.repository.CommentRepository;
import org.blog.backend.blog.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommentServiceImpl")
class CommentServiceImplTest {

    @Mock CommentRepository commentRepository;
    @Mock UserRepository userRepository;
    @Mock PostRepository postRepository;

    @InjectMocks CommentServiceImpl commentService;

    // ─── Shared fixtures ──────────────────────────────────────────────────────

    private UUID userId;
    private UUID postId;
    private UUID commentId;
    private User user;
    private Post post;

    @BeforeEach
    void setUp() {
        userId    = UUID.randomUUID();
        postId    = UUID.randomUUID();
        commentId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("author@example.com")
                .build();

        post = Post.builder()
                .title("Test Post")
                .content("content")
                .postStatus(PostStatus.PUBLISHED)
                .user(user)
                .build();
        post.setId(postId);  // BaseModel field — must use setter
    }

    // ─── addComment ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addComment()")
    class AddComment {

        // ── Guard checks ──────────────────────────────────────────────────────

        @Test
        @DisplayName("throws UserNotFoundException when userId does not exist")
        void unknownUserThrows() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.addComment(
                    requestDto(postId, null, "hi"), userId))
                    .isInstanceOf(UserNotFoundException.class);

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws PostNotFoundException when postId does not exist")
        void unknownPostThrows() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.addComment(
                    requestDto(postId, null, "hi"), userId))
                    .isInstanceOf(PostNotFoundException.class);

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws RuntimeException when parentCommentId does not exist")
        void unknownParentCommentThrows() {
            UUID parentId = UUID.randomUUID();
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.findById(parentId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.addComment(
                    requestDto(postId, parentId, "reply"), userId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Parent comment not found");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws RuntimeException when parent comment belongs to a different post")
        void parentCommentWrongPostThrows() {
            UUID parentId  = UUID.randomUUID();
            Post otherPost = Post.builder().title("Other").content("c")
                    .postStatus(PostStatus.PUBLISHED).user(user).build();
            otherPost.setId(UUID.randomUUID()); // different postId

            Comment parentOnOtherPost = buildComment(parentId, "parent", user, otherPost, null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.findById(parentId)).thenReturn(Optional.of(parentOnOtherPost));

            assertThatThrownBy(() -> commentService.addComment(
                    requestDto(postId, parentId, "reply"), userId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("does not belong to this post");

            verify(commentRepository, never()).save(any());
        }

        // ── Top-level comment ─────────────────────────────────────────────────

        @Test
        @DisplayName("persists top-level comment with parent=null when parentCommentId is null")
        void topLevelComment_noParent() {
            CreateCommentRequestDto request = requestDto(postId, null, "Great post!");

            Comment saved = buildComment(commentId, "Great post!", user, post, null);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(request, userId);

            ArgumentCaptor<Comment> cap = ArgumentCaptor.forClass(Comment.class);
            verify(commentRepository).save(cap.capture());

            Comment persisted = cap.getValue();
            assertThat(persisted.getParent()).isNull();
            assertThat(persisted.getContent()).isEqualTo("Great post!");
            assertThat(persisted.getUser()).isEqualTo(user);
            assertThat(persisted.getPost()).isEqualTo(post);
        }

        @Test
        @DisplayName("returns DTO with correct fields for top-level comment")
        void topLevelComment_dtoFields() {
            Comment saved = buildComment(commentId, "Hello!", user, post, null);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, null, "Hello!"), userId);

            assertThat(dto.getId()).isEqualTo(commentId);
            assertThat(dto.getContent()).isEqualTo("Hello!");
            assertThat(dto.getUserId()).isEqualTo(userId);
            assertThat(dto.getPostId()).isEqualTo(postId);
            assertThat(dto.getParentId()).isNull();   // top-level has no parent
        }

        // ── Reply comment ─────────────────────────────────────────────────────

        @Test
        @DisplayName("persists reply with correct parent reference")
        void replyComment_parentSet() {
            UUID parentId = UUID.randomUUID();
            Comment parentComment = buildComment(parentId, "parent", user, post, null);

            CreateCommentRequestDto request = requestDto(postId, parentId, "my reply");

            Comment saved = buildComment(commentId, "my reply", user, post, parentComment);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.findById(parentId)).thenReturn(Optional.of(parentComment));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(request, userId);

            ArgumentCaptor<Comment> cap = ArgumentCaptor.forClass(Comment.class);
            verify(commentRepository).save(cap.capture());
            assertThat(cap.getValue().getParent()).isEqualTo(parentComment);
            assertThat(dto.getParentId()).isEqualTo(parentId);
        }

        @Test
        @DisplayName("reply DTO parentId matches the parent comment's id")
        void replyComment_parentIdInDto() {
            UUID parentId     = UUID.randomUUID();
            UUID replyId      = UUID.randomUUID();
            Comment parent    = buildComment(parentId, "parent text", user, post, null);
            Comment reply     = buildComment(replyId, "reply text", user, post, parent);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.findById(parentId)).thenReturn(Optional.of(parent));
            when(commentRepository.save(any())).thenReturn(reply);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, parentId, "reply text"), userId);

            assertThat(dto.getParentId()).isEqualTo(parentId);
        }

        @Test
        @DisplayName("does not query commentRepository for parent when parentCommentId is null")
        void noParentQueryWhenParentIdNull() {
            Comment saved = buildComment(commentId, "text", user, post, null);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            commentService.addComment(requestDto(postId, null, "text"), userId);

            verify(commentRepository, never()).findById(any());
        }
    }

    // ─── getCommentsForPost ───────────────────────────────────────────────────

    @Nested
    @DisplayName("getCommentsForPost()")
    class GetCommentsForPost {

        @Test
        @DisplayName("returns empty list when post has no comments")
        void noComments() {
            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of());

            assertThat(commentService.getCommentsForPost(postId)).isEmpty();
            verify(commentRepository, never()).findByParentIdOrderByCreatedAtAsc(any());
        }

        @Test
        @DisplayName("returns flat list of top-level comments with empty replies when no children exist")
        void topLevelOnly_noChildren() {
            UUID c1Id = UUID.randomUUID();
            UUID c2Id = UUID.randomUUID();
            Comment c1 = buildComment(c1Id, "first",  user, post, null);
            Comment c2 = buildComment(c2Id, "second", user, post, null);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(c1, c2));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(c1Id)).thenReturn(List.of());
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(c2Id)).thenReturn(List.of());

            List<CommentResponseDto> result = commentService.getCommentsForPost(postId);

            assertThat(result).hasSize(2);
            assertThat(result).extracting(CommentResponseDto::getId)
                    .containsExactlyInAnyOrder(c1Id, c2Id);
            assertThat(result).allMatch(dto -> dto.getReplies().isEmpty());
        }

        @Test
        @DisplayName("nests one level of replies correctly")
        void singleLevelNesting() {
            UUID rootId  = UUID.randomUUID();
            UUID replyId = UUID.randomUUID();

            Comment root  = buildComment(rootId,  "root text",  user, post, null);
            Comment reply = buildComment(replyId, "reply text", user, post, root);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(root));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(rootId))
                    .thenReturn(List.of(reply));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(replyId))
                    .thenReturn(List.of()); // reply has no children

            List<CommentResponseDto> result = commentService.getCommentsForPost(postId);

            assertThat(result).hasSize(1);
            CommentResponseDto rootDto = result.get(0);
            assertThat(rootDto.getId()).isEqualTo(rootId);
            assertThat(rootDto.getReplies()).hasSize(1);
            assertThat(rootDto.getReplies().get(0).getId()).isEqualTo(replyId);
        }

        @Test
        @DisplayName("nests two levels deep (reply-of-reply) recursively")
        void twoLevelNesting() {
            UUID rootId      = UUID.randomUUID();
            UUID replyId     = UUID.randomUUID();
            UUID nestedId    = UUID.randomUUID();

            Comment root   = buildComment(rootId,   "root",   user, post, null);
            Comment reply  = buildComment(replyId,  "reply",  user, post, root);
            Comment nested = buildComment(nestedId, "nested", user, post, reply);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(root));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(rootId))
                    .thenReturn(List.of(reply));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(replyId))
                    .thenReturn(List.of(nested));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(nestedId))
                    .thenReturn(List.of());

            List<CommentResponseDto> result = commentService.getCommentsForPost(postId);

            CommentResponseDto rootDto   = result.get(0);
            CommentResponseDto replyDto  = rootDto.getReplies().get(0);
            CommentResponseDto nestedDto = replyDto.getReplies().get(0);

            assertThat(rootDto.getId()).isEqualTo(rootId);
            assertThat(replyDto.getId()).isEqualTo(replyId);
            assertThat(nestedDto.getId()).isEqualTo(nestedId);
            assertThat(nestedDto.getReplies()).isEmpty();
        }

        @Test
        @DisplayName("multiple top-level comments each with their own replies")
        void multipleRootsWithReplies() {
            UUID root1Id  = UUID.randomUUID();
            UUID root2Id  = UUID.randomUUID();
            UUID reply1Id = UUID.randomUUID();

            Comment root1  = buildComment(root1Id,  "r1",      user, post, null);
            Comment root2  = buildComment(root2Id,  "r2",      user, post, null);
            Comment reply1 = buildComment(reply1Id, "r1reply", user, post, root1);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(root1, root2));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(root1Id))
                    .thenReturn(List.of(reply1));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(reply1Id))
                    .thenReturn(List.of());
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(root2Id))
                    .thenReturn(List.of());

            List<CommentResponseDto> result = commentService.getCommentsForPost(postId);

            assertThat(result).hasSize(2);
            CommentResponseDto dto1 = result.stream()
                    .filter(d -> d.getId().equals(root1Id)).findFirst().orElseThrow();
            assertThat(dto1.getReplies()).hasSize(1);
            assertThat(dto1.getReplies().get(0).getId()).isEqualTo(reply1Id);

            CommentResponseDto dto2 = result.stream()
                    .filter(d -> d.getId().equals(root2Id)).findFirst().orElseThrow();
            assertThat(dto2.getReplies()).isEmpty();
        }

        @Test
        @DisplayName("queries findByParentId once per comment node during tree build")
        void queryCountMatchesNodeCount() {
            UUID root1Id = UUID.randomUUID();
            UUID root2Id = UUID.randomUUID();
            UUID childId = UUID.randomUUID();

            Comment root1 = buildComment(root1Id, "r1", user, post, null);
            Comment root2 = buildComment(root2Id, "r2", user, post, null);
            Comment child = buildComment(childId, "c",  user, post, root1);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(root1, root2));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(root1Id)).thenReturn(List.of(child));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(root2Id)).thenReturn(List.of());
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(childId)).thenReturn(List.of());

            commentService.getCommentsForPost(postId);

            // 3 nodes → 3 findByParentId calls (root1, root2, child)
            verify(commentRepository, times(3)).findByParentIdOrderByCreatedAtAsc(any());
        }
    }

    // ─── mapToResponse (via addComment + getCommentsForPost) ─────────────────

    @Nested
    @DisplayName("mapToResponse() — DTO field mapping")
    class MapToResponse {

        @Test
        @DisplayName("addComment DTO: replies field is null (not populated on create)")
        void addComment_repliesIsNull() {
            Comment saved = buildComment(commentId, "text", user, post, null);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, null, "text"), userId);

            // mapToResponse(comment, false) sets replies=null
            assertThat(dto.getReplies()).isNull();
        }

        @Test
        @DisplayName("getCommentsForPost DTO: replies field is a list (even when empty)")
        void getComments_repliesIsAlwaysList() {
            UUID rootId = UUID.randomUUID();
            Comment root = buildComment(rootId, "root", user, post, null);

            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId))
                    .thenReturn(List.of(root));
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(rootId))
                    .thenReturn(List.of());

            CommentResponseDto dto = commentService.getCommentsForPost(postId).get(0);

            // mapToResponse(comment, List) always sets a list — never null
            assertThat(dto.getReplies()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("createdAt is mapped from the Comment entity")
        void createdAtMapped() {
            LocalDateTime ts = LocalDateTime.of(2025, 6, 15, 10, 30);
            Comment saved = buildComment(commentId, "text", user, post, null);
            saved.setCreatedAt(ts);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, null, "text"), userId);

            assertThat(dto.getCreatedAt()).isEqualTo(ts);
        }

        @Test
        @DisplayName("parentId is null in DTO when comment has no parent")
        void parentIdNullWhenNoParent() {
            Comment saved = buildComment(commentId, "top-level", user, post, null);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.save(any())).thenReturn(saved);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, null, "top-level"), userId);

            assertThat(dto.getParentId()).isNull();
        }

        @Test
        @DisplayName("parentId is the parent's UUID in DTO when comment is a reply")
        void parentIdSetWhenReply() {
            UUID parentId  = UUID.randomUUID();
            Comment parent = buildComment(parentId, "parent", user, post, null);
            Comment reply  = buildComment(commentId, "reply", user, post, parent);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));
            when(commentRepository.findById(parentId)).thenReturn(Optional.of(parent));
            when(commentRepository.save(any())).thenReturn(reply);

            CommentResponseDto dto = commentService.addComment(
                    requestDto(postId, parentId, "reply"), userId);

            assertThat(dto.getParentId()).isEqualTo(parentId);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Build a Comment with the id set via setter (BaseModel field, excluded from @Builder).
     */
    private Comment buildComment(UUID id, String content, User author, Post parentPost, Comment parent) {
        Comment comment = Comment.builder()
                .content(content)
                .user(author)
                .post(parentPost)
                .parent(parent)
                .replies(new ArrayList<>())
                .build();
        comment.setId(id);          // BaseModel field
        comment.setCreatedAt(LocalDateTime.now());
        return comment;
    }

    private CreateCommentRequestDto requestDto(UUID postId, UUID parentCommentId, String content) {
        return CreateCommentRequestDto.builder()
                .postId(postId)
                .parentCommentId(parentCommentId)
                .content(content)
                .build();
    }
}