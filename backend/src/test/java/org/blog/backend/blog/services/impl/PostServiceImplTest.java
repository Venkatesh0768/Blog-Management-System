package org.blog.backend.blog.services.impl;

import org.blog.backend.auth.exception.EmailNotVerifiedException;
import org.blog.backend.auth.exception.UserNotFoundException;
import org.blog.backend.auth.model.User;
import org.blog.backend.auth.repository.UserRepository;
import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostResponseDtos.PostResponseDto;
import org.blog.backend.blog.exception.PostNotFoundException;
import org.blog.backend.blog.model.Comment;
import org.blog.backend.blog.model.Post;
import org.blog.backend.blog.model.PostImages;
import org.blog.backend.blog.model.PostStatus;
import org.blog.backend.blog.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.DisabledException;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostServiceImpl")
class PostServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PostRepository postRepository;

    @InjectMocks PostServiceImpl postService;

    private UUID userId;
    private UUID postId;
    private User activeUser;       // enabled=true, emailVerified=true
    private User disabledUser;     // enabled=false
    private User unverifiedUser;   // enabled=true, emailVerified=false

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        postId = UUID.randomUUID();

        activeUser = User.builder()
                .id(userId)
                .email("author@example.com")
                .enabled(true)
                .emailVerified(true)
                .build();

        disabledUser = User.builder()
                .id(UUID.randomUUID())
                .email("disabled@example.com")
                .enabled(false)
                .emailVerified(true)
                .build();

        unverifiedUser = User.builder()
                .id(UUID.randomUUID())
                .email("unverified@example.com")
                .enabled(true)
                .emailVerified(false)
                .build();
    }

    // ─── createPost ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createPost()")
    class CreatePost {

        // ── Guard checks ──────────────────────────────────────────────────────

        @Test
        @DisplayName("throws UserNotFoundException when email is not registered")
        void unknownEmailThrows() {
            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.createPost(minimalRequest(), "ghost@example.com"))
                    .isInstanceOf(UserNotFoundException.class);

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws DisabledException when user account is disabled")
        void disabledUserThrows() {
            when(userRepository.findByEmail("disabled@example.com")).thenReturn(Optional.of(disabledUser));

            assertThatThrownBy(() -> postService.createPost(minimalRequest(), "disabled@example.com"))
                    .isInstanceOf(DisabledException.class)
                    .hasMessageContaining("not Enable");

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws EmailNotVerifiedException when user email is not verified")
        void unverifiedEmailThrows() {
            when(userRepository.findByEmail("unverified@example.com")).thenReturn(Optional.of(unverifiedUser));

            assertThatThrownBy(() -> postService.createPost(minimalRequest(), "unverified@example.com"))
                    .isInstanceOf(EmailNotVerifiedException.class)
                    .hasMessageContaining("not Verified");

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("DisabledException is thrown before EmailNotVerifiedException (guard order)")
        void disabledCheckedBeforeEmailVerification() {
            User bothFailing = User.builder()
                    .id(UUID.randomUUID())
                    .email("bad@example.com")
                    .enabled(false)
                    .emailVerified(false)
                    .build();
            when(userRepository.findByEmail("bad@example.com")).thenReturn(Optional.of(bothFailing));

            assertThatThrownBy(() -> postService.createPost(minimalRequest(), "bad@example.com"))
                    .isInstanceOf(DisabledException.class);
        }

        // ── Happy path ────────────────────────────────────────────────────────

        @Test
        @DisplayName("persists post with correct fields and returns mapped DTO")
        void happyPath() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Hello World")
                    .content("Some content")
                    .postStatus(PostStatus.PUBLISHED)
                    .build();

            Post saved = buildPost("Hello World", "hello-world", "Some content", PostStatus.PUBLISHED);
            when(userRepository.findByEmail("author@example.com")).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any(Post.class))).thenReturn(saved);

            PostResponseDto dto = postService.createPost(request, "author@example.com");

            assertThat(dto.getTitle()).isEqualTo("Hello World");
            assertThat(dto.getSlug()).isEqualTo("hello-world");
            assertThat(dto.getUserId()).isEqualTo(userId);
            assertThat(dto.getPostStatus()).isEqualTo(PostStatus.PUBLISHED);
        }

        @Test
        @DisplayName("trims whitespace from title before persisting")
        void titleIsTrimmed() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("  Padded Title  ")
                    .content("content")
                    .postStatus(PostStatus.DRAFT)
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());
            assertThat(cap.getValue().getTitle()).isEqualTo("Padded Title");
            assertThat(cap.getValue().getSlug()).isEqualTo("padded-title");
        }

        @Test
        @DisplayName("treats null title as empty string and produces empty slug")
        void nullTitleHandled() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title(null)
                    .content("content")
                    .postStatus(PostStatus.DRAFT)
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());
            assertThat(cap.getValue().getTitle()).isEmpty();
            assertThat(cap.getValue().getSlug()).isEmpty();
        }

        // ── Image handling ────────────────────────────────────────────────────

        @Test
        @DisplayName("attaches primary image with isPrimary=true")
        void primaryImageAttachedAsPrimary() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Photo Post").content("content").postStatus(PostStatus.PUBLISHED)
                    .primaryImage("https://cdn.example.com/hero.jpg")
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());

            List<PostImages> images = cap.getValue().getImages();
            assertThat(images).hasSize(1);
            assertThat(images.get(0).getIsPrimary()).isTrue();
            assertThat(images.get(0).getImageUrl()).isEqualTo("https://cdn.example.com/hero.jpg");
        }

        @Test
        @DisplayName("attaches secondary images with isPrimary=false")
        void secondaryImagesAttachedAsNonPrimary() {
            List<String> urls = List.of("https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg");
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Gallery Post").content("content").postStatus(PostStatus.PUBLISHED)
                    .secondaryImages(urls)
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());

            List<PostImages> images = cap.getValue().getImages();
            assertThat(images).hasSize(2);
            assertThat(images).allMatch(img -> !img.getIsPrimary());
            assertThat(images).extracting(PostImages::getImageUrl)
                    .containsExactlyInAnyOrder(urls.toArray(new String[0]));
        }

        @Test
        @DisplayName("primary image is first in list, secondary images follow")
        void primaryImageIsFirst() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Mixed").content("content").postStatus(PostStatus.PUBLISHED)
                    .primaryImage("https://cdn.example.com/primary.jpg")
                    .secondaryImages(List.of("https://cdn.example.com/s1.jpg"))
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());

            List<PostImages> images = cap.getValue().getImages();
            assertThat(images).hasSize(2);
            assertThat(images.get(0).getIsPrimary()).isTrue();
            assertThat(images.get(1).getIsPrimary()).isFalse();
        }

        @Test
        @DisplayName("image list is empty when both primaryImage and secondaryImages are null")
        void noImages() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Text Only").content("content").postStatus(PostStatus.DRAFT)
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());
            assertThat(cap.getValue().getImages()).isEmpty();
        }

        @Test
        @DisplayName("every PostImages holds a back-reference to the parent post")
        void imagesHoldBackReferenceToPost() {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title("Ref Test").content("content").postStatus(PostStatus.PUBLISHED)
                    .primaryImage("https://cdn.example.com/img.jpg")
                    .secondaryImages(List.of("https://cdn.example.com/s.jpg"))
                    .build();

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());

            Post savedPost = cap.getValue();
            assertThat(savedPost.getImages()).allMatch(img -> img.getPost() == savedPost);
        }
    }

    // ─── getAllPost ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAllPost()")
    class GetAllPost {

        @Test
        @DisplayName("returns all posts mapped to DTOs")
        void happyPath() {
            when(postRepository.findAll()).thenReturn(List.of(
                    buildPost("Post One", "post-one", "c1", PostStatus.PUBLISHED),
                    buildPost("Post Two", "post-two", "c2", PostStatus.DRAFT)
            ));

            List<PostResponseDto> result = postService.getAllPost();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(PostResponseDto::getTitle)
                    .containsExactlyInAnyOrder("Post One", "Post Two");
        }

        @Test
        @DisplayName("returns empty list when repository is empty")
        void emptyRepository() {
            when(postRepository.findAll()).thenReturn(List.of());
            assertThat(postService.getAllPost()).isEmpty();
        }
    }

    // ─── getPostsOfUser ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("getPostsOfUser()")
    class GetPostsOfUser {

        @Test
        @DisplayName("returns posts belonging to the found user")
        void happyPath() {
            when(userRepository.findByEmail("author@example.com")).thenReturn(Optional.of(activeUser));
            when(postRepository.findByUserId(userId)).thenReturn(
                    List.of(buildPost("My Post", "my-post", "content", PostStatus.PUBLISHED)));

            List<PostResponseDto> result = postService.getPostsOfUser("author@example.com");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("My Post");
        }

        @Test
        @DisplayName("returns empty list when user has no posts")
        void noPostsForUser() {
            when(userRepository.findByEmail("author@example.com")).thenReturn(Optional.of(activeUser));
            when(postRepository.findByUserId(userId)).thenReturn(List.of());

            assertThat(postService.getPostsOfUser("author@example.com")).isEmpty();
        }

        @Test
        @DisplayName("throws UserNotFoundException for unknown email")
        void unknownEmail() {
            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.getPostsOfUser("ghost@example.com"))
                    .isInstanceOf(UserNotFoundException.class);
        }

        @Test
        @DisplayName("queries repository using the user's UUID, not email string")
        void queriesWithUserId() {
            when(userRepository.findByEmail("author@example.com")).thenReturn(Optional.of(activeUser));
            when(postRepository.findByUserId(userId)).thenReturn(List.of());

            postService.getPostsOfUser("author@example.com");

            verify(postRepository).findByUserId(userId);
            verify(postRepository, never()).findAll();
        }
    }

    // ─── getPostById ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getPostById()")
    class GetPostById {

        @Test
        @DisplayName("returns correct DTO when post exists")
        void happyPath() {
            Post post = buildPost("Found Post", "found-post", "content", PostStatus.PUBLISHED);
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            PostResponseDto dto = postService.getPostById(postId);

            assertThat(dto.getTitle()).isEqualTo("Found Post");
            assertThat(dto.getSlug()).isEqualTo("found-post");
            assertThat(dto.getUserId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("throws PostNotFoundException when post does not exist")
        void postNotFound() {
            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.getPostById(postId))
                    .isInstanceOf(PostNotFoundException.class)
                    .hasMessageContaining("not found");
        }
    }

    // ─── updatePost ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updatePost()")
    class UpdatePost {

        @Test
        @DisplayName("updates title, slug, content and status when all fields provided")
        void fullUpdate() {
            Post existing = buildPost("Old Title", "old-title", "old content", PostStatus.DRAFT);
            UpdatePostRequestDto request = UpdatePostRequestDto.builder()
                    .title("New Title").content("New content").postStatus(PostStatus.PUBLISHED).build();

            when(postRepository.findById(postId)).thenReturn(Optional.of(existing));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            PostResponseDto dto = postService.updatePost(request, postId);

            assertThat(dto.getTitle()).isEqualTo("New Title");
            assertThat(dto.getSlug()).isEqualTo("new-title");
            assertThat(dto.getContent()).isEqualTo("New content");
            assertThat(dto.getPostStatus()).isEqualTo(PostStatus.PUBLISHED);
        }

        @Test
        @DisplayName("partial update: only content changes, title/slug/status kept")
        void partialUpdate_contentOnly() {
            Post existing = buildPost("Kept Title", "kept-title", "original content", PostStatus.DRAFT);
            UpdatePostRequestDto request = UpdatePostRequestDto.builder()
                    .content("Updated content only").build();

            when(postRepository.findById(postId)).thenReturn(Optional.of(existing));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            PostResponseDto dto = postService.updatePost(request, postId);

            assertThat(dto.getTitle()).isEqualTo("Kept Title");
            assertThat(dto.getSlug()).isEqualTo("kept-title");
            assertThat(dto.getContent()).isEqualTo("Updated content only");
            assertThat(dto.getPostStatus()).isEqualTo(PostStatus.DRAFT);
        }

        @Test
        @DisplayName("trims whitespace from updated title and regenerates slug accordingly")
        void titleTrimmedOnUpdate() {
            Post existing = buildPost("Old", "old", "content", PostStatus.DRAFT);
            UpdatePostRequestDto request = UpdatePostRequestDto.builder()
                    .title("  Trimmed New Title  ").build();

            when(postRepository.findById(postId)).thenReturn(Optional.of(existing));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            PostResponseDto dto = postService.updatePost(request, postId);

            assertThat(dto.getTitle()).isEqualTo("Trimmed New Title");
            assertThat(dto.getSlug()).isEqualTo("trimmed-new-title");
        }

        @Test
        @DisplayName("all-null request keeps every post field unchanged")
        void allNullFieldsIsNoOp() {
            Post existing = buildPost("Stable", "stable", "stable content", PostStatus.PUBLISHED);
            UpdatePostRequestDto request = UpdatePostRequestDto.builder().build();

            when(postRepository.findById(postId)).thenReturn(Optional.of(existing));
            when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            PostResponseDto dto = postService.updatePost(request, postId);

            assertThat(dto.getTitle()).isEqualTo("Stable");
            assertThat(dto.getContent()).isEqualTo("stable content");
            assertThat(dto.getPostStatus()).isEqualTo(PostStatus.PUBLISHED);
        }

        @Test
        @DisplayName("throws PostNotFoundException and never calls save when post does not exist")
        void postNotFound() {
            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.updatePost(
                    UpdatePostRequestDto.builder().title("x").build(), postId))
                    .isInstanceOf(PostNotFoundException.class);

            verify(postRepository, never()).save(any());
        }
    }

    // ─── deletePost ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deletePost()")
    class DeletePost {

        @Test
        @DisplayName("fetches post and calls repository.delete() with the correct entity")
        void happyPath() {
            Post post = buildPost("To Delete", "to-delete", "content", PostStatus.DRAFT);
            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            postService.deletePost(postId);

            verify(postRepository).delete(post);
        }

        @Test
        @DisplayName("throws PostNotFoundException and never calls delete when post does not exist")
        void postNotFound() {
            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.deletePost(postId))
                    .isInstanceOf(PostNotFoundException.class);

            verify(postRepository, never()).delete(any());
        }
    }

    // ─── Slug generation ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Slug generation (via createPost)")
    class SlugGeneration {

        @ParameterizedTest(name = "''{0}'' → ''{1}''")
        @CsvSource({
                "Hello World,         hello-world",
                "  Trimmed  ,         trimmed",
                "Multiple   Spaces,   multiple-spaces",
                "ALL CAPS TITLE,      all-caps-title",
                "special!@#chars,     special-chars",
                "---Leading Dashes--, leading-dashes",
                "123 Numeric Title,   123-numeric-title",
                "a,                   a"
        })
        @DisplayName("generates correct slug from title")
        void slugVariants(String title, String expectedSlug) {
            CreatePostRequestDto request = CreatePostRequestDto.builder()
                    .title(title).content("c").postStatus(PostStatus.DRAFT).build();

            // lenient() prevents UnnecessaryStubbingException — Mockito validates stubs
            // after each parameterized iteration, but the stub registered on iteration N
            // is reused on iteration N+1 inside the same test method lifecycle. Without
            // lenient(), the last iteration's stub is flagged as unused on afterEach.
            lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
            lenient().when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            postService.createPost(request, "author@example.com");

            ArgumentCaptor<Post> cap = ArgumentCaptor.forClass(Post.class);
            verify(postRepository).save(cap.capture());
            assertThat(cap.getValue().getSlug()).isEqualTo(expectedSlug.trim());
        }
    }
    // ─── mapToResponse: comments & images ─────────────────────────────────────

    @Nested
    @DisplayName("mapToResponse() — comments and images")
    class MapToResponse {

        @Test
        @DisplayName("only top-level comments (parent == null) are included in commentIds")
        void onlyTopLevelCommentsReturned() {
            Post post = buildPost("Post", "post", "content", PostStatus.PUBLISHED);
            Comment topLevel = Comment.builder().parent(null).build();
            Comment reply    = Comment.builder().parent(topLevel).build();
            post.setComments(new ArrayList<>(List.of(topLevel, reply)));

            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            PostResponseDto dto = postService.getPostById(postId);

            assertThat(dto.getCommentIds()).hasSize(1).containsExactly(topLevel.getId());
        }

        @Test
        @DisplayName("returns empty commentIds when all comments are replies")
        void allRepliesResultsInEmptyCommentIds() {
            Post post = buildPost("Post", "post", "content", PostStatus.PUBLISHED);
            Comment parent = Comment.builder().parent(null).build();
            Comment reply1 = Comment.builder().parent(parent).build();
            Comment reply2 = Comment.builder().parent(parent).build();
            post.setComments(new ArrayList<>(List.of(reply1, reply2)));

            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            assertThat(postService.getPostById(postId).getCommentIds()).isEmpty();
        }

        @Test
        @DisplayName("all image URLs are mapped to imageUrls regardless of isPrimary")
        void allImageUrlsMapped() {
            Post post = buildPost("Post", "post", "content", PostStatus.PUBLISHED);

            UUID imgId1 = UUID.randomUUID();
            PostImages img1 = PostImages.builder().isPrimary(true).imageUrl("u1").post(post).build();
            img1.setId(imgId1); // id lives on BaseModel — not included in @Builder, must use setter

            UUID imgId2 = UUID.randomUUID();
            PostImages img2 = PostImages.builder().isPrimary(false).imageUrl("u2").post(post).build();
            img2.setId(imgId2);

            post.setImages(new ArrayList<>(List.of(img1, img2)));

            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            assertThat(postService.getPostById(postId).getImageUrls())
                    .containsExactlyInAnyOrder("u1", "u2");
        }

        @Test
        @DisplayName("returns empty lists when post has null comments and null images")
        void nullCollectionsReturnEmptyLists() {
            Post post = buildPost("Post", "post", "content", PostStatus.PUBLISHED);
            post.setComments(null);
            post.setImages(null);

            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            PostResponseDto dto = postService.getPostById(postId);
            assertThat(dto.getCommentIds()).isEmpty();
            assertThat(dto.getImageUrls()).isEmpty();
        }

        @Test
        @DisplayName("DTO carries correct metadata: id, userId, createdAt, updatedAt")
        void metadataMappedCorrectly() {
            LocalDateTime now = LocalDateTime.now();
            Post post = buildPost("Post", "post", "content", PostStatus.PUBLISHED);
            post.setId(postId);       // id is on BaseModel — set explicitly in case builder excludes it
            post.setCreatedAt(now);
            post.setUpdatedAt(now);

            when(postRepository.findById(postId)).thenReturn(Optional.of(post));

            PostResponseDto dto = postService.getPostById(postId);

            assertThat(dto.getId()).isEqualTo(postId);
            assertThat(dto.getUserId()).isEqualTo(userId);
            assertThat(dto.getCreatedAt()).isEqualTo(now);
            assertThat(dto.getUpdatedAt()).isEqualTo(now);
        }
    }

    // ─── PostImages entity ────────────────────────────────────────────────────

    @Nested
    @DisplayName("PostImages entity")
    class PostImagesEntityTest {

        @Test
        @DisplayName("no-arg constructor produces non-null object with null url and null post")
        void noArgConstructor() {
            PostImages img = new PostImages();
            assertThat(img).isNotNull();
            assertThat(img.getImageUrl()).isNull();
            assertThat(img.getPost()).isNull();
        }

        @Test
        @DisplayName("isPrimary field initializes to false via field initializer")
        void isPrimaryDefaultsFalse() {
            PostImages img = new PostImages();
            assertThat(img.getIsPrimary()).isFalse();
        }

        @Test
        @DisplayName("builder sets isPrimary=true correctly")
        void builderSetsPrimary() {
            Post post = buildPost("P", "p", "c", PostStatus.PUBLISHED);
            PostImages img = PostImages.builder()
                    .post(post)
                    .imageUrl("https://cdn.example.com/hero.jpg")
                    .isPrimary(true)
                    .build();

            assertThat(img.getIsPrimary()).isTrue();
            assertThat(img.getImageUrl()).isEqualTo("https://cdn.example.com/hero.jpg");
            assertThat(img.getPost()).isSameAs(post);
        }

        @Test
        @DisplayName("builder sets isPrimary=false for secondary image")
        void builderSetsSecondary() {
            PostImages img = PostImages.builder()
                    .imageUrl("https://cdn.example.com/secondary.jpg")
                    .isPrimary(false)
                    .build();

            assertThat(img.getIsPrimary()).isFalse();
        }

        @Test
        @DisplayName("setter roundtrip: setIsPrimary(true) then setIsPrimary(false)")
        void setterRoundtrip() {
            PostImages img = new PostImages();
            img.setIsPrimary(true);
            assertThat(img.getIsPrimary()).isTrue();

            img.setIsPrimary(false);
            assertThat(img.getIsPrimary()).isFalse();
        }

        @Test
        @DisplayName("imageUrl is stored and retrieved unchanged via setter")
        void imageUrlRoundtrip() {
            PostImages img = new PostImages();
            img.setImageUrl("https://cdn.example.com/test.png");
            assertThat(img.getImageUrl()).isEqualTo("https://cdn.example.com/test.png");
        }

        @Test
        @DisplayName("all-arg constructor sets post, imageUrl, and isPrimary correctly")
        void allArgConstructor() {
            Post post = buildPost("P", "p", "c", PostStatus.PUBLISHED);
            PostImages img = new PostImages(post, "https://cdn.example.com/img.jpg", true);

            assertThat(img.getPost()).isSameAs(post);
            assertThat(img.getImageUrl()).isEqualTo("https://cdn.example.com/img.jpg");
            assertThat(img.getIsPrimary()).isTrue();
        }

        @Test
        @DisplayName("two independently built images are not the same object")
        void eachBuilderCallProducesNewInstance() {
            PostImages img1 = PostImages.builder().imageUrl("a.jpg").isPrimary(true).build();
            PostImages img2 = PostImages.builder().imageUrl("b.jpg").isPrimary(false).build();

            assertThat(img1).isNotSameAs(img2);
            assertThat(img1.getImageUrl()).isNotEqualTo(img2.getImageUrl());
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Post buildPost(String title, String slug, String content, PostStatus status) {
        Post post = Post.builder()
                .title(title)
                .slug(slug)
                .content(content)
                .postStatus(status)
                .user(activeUser)
                .comments(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        // id is defined on BaseModel and excluded from @Builder — must set via setter
        post.setId(postId);
        return post;
    }

    private CreatePostRequestDto minimalRequest() {
        return CreatePostRequestDto.builder()
                .title("title")
                .content("content")
                .postStatus(PostStatus.DRAFT)
                .build();
    }
}