import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import { createPost, deletePost, getAllPosts, incrementPostLike, getAllComments, postComment } from '@/config/redux/action/postAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from "./index.module.css";
import { BASE_URL } from '@/config';
import { resetPostId } from '@/config/redux/reducer/postReducer';

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useDispatch();
    
    // Selectors
    const authState = useSelector((state) => state.auth);
    const postState = useSelector((state) => state.postReducer);
    
    // Local State
    const [postContent, setPostContent] = useState("");
    const [fileContent, setFileContent] = useState(null);
    const [commentsText, setCommentsText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push("/login");
            return;
        }

        // Initial Data Fetch
        dispatch(getAllPosts());
        dispatch(getAboutUser({ token }));

        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }
    }, [dispatch]); // Removed router/authState to prevent unnecessary re-runs

    const handleUpload = async () => {
        if (!postContent.trim() && !fileContent) return;

        const token = localStorage.getItem('token');
        await dispatch(createPost({
            file: fileContent,
            body: postContent,
            token // Ensure token is passed if your action requires it
        }));

        // Reset form and refresh list
        setPostContent("");
        setFileContent(null);
        dispatch(getAllPosts());
    };

    const handleDelete = async (postId) => {
        const token = localStorage.getItem("token");
        await dispatch(deletePost({ post_id: postId, token }));
        dispatch(getAllPosts());
    };

    const handleLike = async (postId) => {
        const token = localStorage.getItem("token");
        await dispatch(incrementPostLike({ post_id: postId, token }));
        dispatch(getAllPosts());
    };

    const handlePostComment = async () => {
        if (!commentsText.trim()) return;
        
        await dispatch(postComment({
            post_id: postState.postId,
            body: commentsText,
        }));
        
        setCommentsText("");
        dispatch(getAllComments({ post_id: postState.postId }));
    };

    // Conditional Loading View
    if (!authState.user) {
        return (
            <UserLayout>
                <DashboardLayout>
                    <div className={styles.scrollComponent}>
                        <div className={styles.createPostContainer}>
                            <h2>Loading Profile...</h2>
                        </div>
                    </div>
                </DashboardLayout>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.scrollComponent}>
                    <div className={styles.wrapper}>
                        {/* CREATE POST SECTION */}
                        <div className={styles.createPostContainer}>
                            <img 
                                className={styles.userProfile}
                                src={authState?.user?.userId?.profilePicture ? `${BASE_URL}/${authState.user.userId.profilePicture}` : "/default-avatar.png"} 
                                alt="Profile" 
                            />
                            <textarea
                                onChange={(e) => setPostContent(e.target.value)}
                                value={postContent}
                                className={styles.textareaContent}
                                placeholder="What's on your mind?"
                            ></textarea>

                            <label htmlFor='fileUpload' className={styles.fab}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '24px'}}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </label>
                            <input type="file" id="fileUpload" hidden onChange={(e) => setFileContent(e.target.files[0])} />

                            {(postContent.length > 0 || fileContent) && (
                                <div onClick={handleUpload} className={styles.uploadButton}>Post</div>
                            )}
                        </div>

                        {/* POSTS FEED */}
                        <div className={styles.postContainer}>
                            {postState.posts?.map((post) => (
                                <div key={post?._id} className={styles.singleCard}>
                                    <div className={styles.singleCard_profileContainer}>
                                        <img 
                                            className={styles.userProfile} 
                                            src={post.userId?.profilePicture ? `${BASE_URL}/${post.userId.profilePicture}` : "/default-avatar.png"} 
                                            alt="User" 
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ fontWeight: "bold" }}>{post.userId?.name || "Unknown User"}</p>
                                                {post.userId?._id === authState.user?.userId?._id && (
                                                    <div onClick={() => handleDelete(post._id)} style={{ cursor: "pointer" }}>
                                                        <svg style={{ height: "1.3em", color: "red" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ color: "gray", fontSize: '0.8rem' }}> @{post.userId?.username || 'user'}</p>
                                            <p style={{ paddingTop: "1rem" }}>{post.body}</p>
                                            
                                            {post.media && (
                                                <div className={styles.singleCard_Image}>
                                                    <img src={`${BASE_URL}/${post.media}`} alt="Post Media" />
                                                </div>
                                            )}

                                            <div className={styles.optionContainer}>
                                                <div onClick={() => handleLike(post._id)} className={styles.singleOption_optionContainer}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904" />
                                                    </svg>
                                                    <p>{post.likes}</p>
                                                </div>
                                                <div onClick={() => dispatch(getAllComments({ post_id: post._id }))} className={styles.singleOption_optionContainer}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                                                    </svg>
                                                    <p>Comments</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COMMENTS MODAL */}
                {postState.postId && (
                    <div onClick={() => dispatch(resetPostId())} className={styles.commentsContainer}>
                        <div onClick={(e) => e.stopPropagation()} className={styles.allCommentsContainer}>
                            {(!postState.comments || postState.comments.length === 0) ? (
                                <h2>No Comments Yet</h2>
                            ) : (
                                <div className={styles.commentsList}>
                                    {postState.comments.map((comment) => (
                                        <div className={styles.singleComment} key={comment._id}>
                                            <div className={styles.singleComment__profileContainer}>
                                                <img src={`${BASE_URL}/${comment.userId?.profilePicture}`} alt="" />
                                                <div>
                                                    <p style={{ fontWeight: "bold" }}>{comment.userId?.name}</p>
                                                    <p style={{ fontSize: '0.8rem' }}>@{comment.userId?.username}</p>
                                                </div>
                                            </div>
                                            <p style={{ marginTop: '0.5rem' }}>{comment.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.postCommentContainer}>
                                <input
                                    type="text"
                                    value={commentsText}
                                    onChange={(e) => setCommentsText(e.target.value)}
                                    placeholder="Write a comment..."
                                />
                                <div className={styles.postCommentContainer__commentBtn} onClick={handlePostComment}>
                                    <p>Send</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </UserLayout>
    );
}