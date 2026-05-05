package org.blog.backend.blog.services.impl;

import org.blog.backend.auth.exception.UserNotFoundException;
import org.blog.backend.auth.model.User;
import org.blog.backend.auth.repository.UserRepository;
import org.blog.backend.blog.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.blog.dto.commentsDto.commentResponseDtos.CommentResponseDto;
import org.blog.backend.blog.exception.EmailNotFoundException;
import org.blog.backend.blog.exception.PostNotFoundException;
import org.blog.backend.blog.model.Comment;
import org.blog.backend.blog.model.Post;
import org.blog.backend.blog.repository.CommentRepository;
import org.blog.backend.blog.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Comment Service Implementation Tests")
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    private static final String USER_EMAIL = "test@example.com";
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID POST_ID = UUID.randomUUID();

    private User mockUser;
    private Post mockPost;

    @BeforeEach
    void setUp() {
        // Avoiding Lombok builder here because @Builder on child classes
        // doesn't inherit properties from BaseModel (like 'id').
        mockUser = new User();
        mockUser.setId(USER_ID);
        mockUser.setEmail(USER_EMAIL);

        mockPost = new Post();
        mockPost.setId(POST_ID);
    }

    @Nested
    @DisplayName("addComment() Tests")
    class AddCommentTests {

        @Test
        @DisplayName("Should successfully add a top-level comment")
        void addComment_TopLevel_Success() {
            // Arrange
            CreateCommentRequestDto request = CreateCommentRequestDto.builder()
                    .postId(POST_ID)
                    .content("Great post!")
                    .parentCommentId(null)
                    .build();

            Comment savedComment = createMockComment(UUID.randomUUID(), "Great post!", null);

            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(mockUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
            when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

            // Act
            CommentResponseDto response = commentService.addComment(request, USER_EMAIL);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isEqualTo("Great post!");
            assertThat(response.getParentId()).isNull();

            verify(commentRepository).save(commentCaptor.capture());
            Comment capturedComment = commentCaptor.getValue();
            assertThat(capturedComment.getContent()).isEqualTo("Great post!");
            assertThat(capturedComment.getParent()).isNull();
            assertThat(capturedComment.getUser()).isEqualTo(mockUser);
            assertThat(capturedComment.getPost()).isEqualTo(mockPost);
        }

        @Test
        @DisplayName("Should successfully add a reply to an existing comment")
        void addComment_Reply_Success() {
            // Arrange
            UUID parentCommentId = UUID.randomUUID();
            Comment parentComment = createMockComment(parentCommentId, "Parent content", null);

            CreateCommentRequestDto request = CreateCommentRequestDto.builder()
                    .postId(POST_ID)
                    .content("This is a reply")
                    .parentCommentId(parentCommentId)
                    .build();

            Comment savedReply = createMockComment(UUID.randomUUID(), "This is a reply", parentComment);

            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(mockUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
            when(commentRepository.findById(parentCommentId)).thenReturn(Optional.of(parentComment));
            when(commentRepository.save(any(Comment.class))).thenReturn(savedReply);

            // Act
            CommentResponseDto response = commentService.addComment(request, USER_EMAIL);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getParentId()).isEqualTo(parentCommentId);

            verify(commentRepository).save(commentCaptor.capture());
            Comment capturedComment = commentCaptor.getValue();
            assertThat(capturedComment.getParent()).isEqualTo(parentComment);
        }

        @Test
        @DisplayName("Should throw EmailNotFoundException when user does not exist")
        void addComment_UserNotFound_ThrowsException() {
            // Arrange
            CreateCommentRequestDto request = CreateCommentRequestDto.builder().postId(POST_ID).build();
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> commentService.addComment(request, USER_EMAIL))
                    .isInstanceOf(EmailNotFoundException.class)
                    .hasMessageContaining("NO User Found");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw PostNotFoundException when post does not exist")
        void addComment_PostNotFound_ThrowsException() {
            // Arrange
            CreateCommentRequestDto request = CreateCommentRequestDto.builder().postId(POST_ID).build();
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(mockUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> commentService.addComment(request, USER_EMAIL))
                    .isInstanceOf(PostNotFoundException.class)
                    .hasMessageContaining("Post is not Found");

            verify(commentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw RuntimeException when parent comment belongs to a different post")
        void addComment_ParentBelongsToDifferentPost_ThrowsException() {
            // Arrange
            UUID parentId = UUID.randomUUID();
            Post differentPost = new Post();
            differentPost.setId(UUID.randomUUID()); // Different ID

            Comment parentComment = createMockComment(parentId, "Parent", null);
            parentComment.setPost(differentPost); // Parent tied to different post

            CreateCommentRequestDto request = CreateCommentRequestDto.builder()
                    .postId(POST_ID)
                    .parentCommentId(parentId)
                    .build();

            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(mockUser));
            when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
            when(commentRepository.findById(parentId)).thenReturn(Optional.of(parentComment));

            // Act & Assert
            assertThatThrownBy(() -> commentService.addComment(request, USER_EMAIL))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Parent comment does not belong to this post");

            verify(commentRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getCommentsForPost() Tests")
    class GetCommentsForPostTests {

        @Test
        @DisplayName("Should return empty list when no comments exist for post")
        void getCommentsForPost_NoComments_ReturnsEmptyList() {
            // Arrange
            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(POST_ID))
                    .thenReturn(Collections.emptyList());

            // Act
            List<CommentResponseDto> result = commentService.getCommentsForPost(POST_ID);

            // Assert
            assertThat(result).isEmpty();
            verify(commentRepository, never()).findByParentIdOrderByCreatedAtAsc(any());
        }

        @Test
        @DisplayName("Should build nested tree correctly (Root -> Child -> Grandchild)")
        void getCommentsForPost_NestedTree_BuildsCorrectly() {
            // Arrange
            UUID rootId = UUID.randomUUID();
            UUID childId = UUID.randomUUID();
            UUID grandChildId = UUID.randomUUID();

            Comment root = createMockComment(rootId, "Root", null);
            Comment child = createMockComment(childId, "Child", root);
            Comment grandChild = createMockComment(grandChildId, "Grandchild", child);

            // Mock finding the root
            when(commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(POST_ID))
                    .thenReturn(List.of(root));

            // Mock finding children of root
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(rootId))
                    .thenReturn(List.of(child));

            // Mock finding children of child
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(childId))
                    .thenReturn(List.of(grandChild));

            // Mock finding children of grandchild (leaf node)
            when(commentRepository.findByParentIdOrderByCreatedAtAsc(grandChildId))
                    .thenReturn(Collections.emptyList());

            // Act
            List<CommentResponseDto> result = commentService.getCommentsForPost(POST_ID);

            // Assert
            assertThat(result).hasSize(1);

            CommentResponseDto rootDto = result.get(0);
            assertThat(rootDto.getContent()).isEqualTo("Root");
            assertThat(rootDto.getReplies()).hasSize(1);

            CommentResponseDto childDto = rootDto.getReplies().get(0);
            assertThat(childDto.getContent()).isEqualTo("Child");
            assertThat(childDto.getParentId()).isEqualTo(rootId);
            assertThat(childDto.getReplies()).hasSize(1);

            CommentResponseDto grandChildDto = childDto.getReplies().get(0);
            assertThat(grandChildDto.getContent()).isEqualTo("Grandchild");
            assertThat(grandChildDto.getParentId()).isEqualTo(childId);
            assertThat(grandChildDto.getReplies()).isEmpty();
        }
    }

    // ----------- Private Test Helpers -----------

    private Comment createMockComment(UUID id, String content, Comment parent) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setContent(content);
        comment.setUser(mockUser);
        comment.setPost(mockPost);
        comment.setParent(parent);
        comment.setCreatedAt(LocalDateTime.now());
        return comment;
    }
}