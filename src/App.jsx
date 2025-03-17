import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  console.log(import.meta.env.VITE_BASE_URI)
  const defaultVideoId = 'IqLWMJB8hYk';
  const [videoId, setVideoId] = useState(defaultVideoId);
  const [videoDetails, setVideoDetails] = useState(null);
  const [comment, setComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [comments, setComments] = useState([]);

  const fetchVideoDetails = async (id = videoId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}api/youtube/video/${id}`);
      setVideoDetails(response.data);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching video:', err);
    }
  };

  useEffect(() => {
    fetchVideoDetails(defaultVideoId);
  }, []);

  const addComment = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}`, { comment });
      const newComment = {
        id: response.data.id, // Comment thread ID from YouTube API response
        text: response.data.snippet.topLevelComment.snippet.textOriginal,
        author: response.data.snippet.topLevelComment.snippet.authorDisplayName,
        publishedAt: response.data.snippet.topLevelComment.snippet.publishedAt,
      };
      
      // Update comments state immediately with the new comment
      setComments((prevComments) => [...prevComments, newComment]);
      alert('Comment added!');
      setComment('');
      // Optional: fetchVideoDetails(); // You can still call this if you want to ensure sync with server
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}api/youtube/comment/${videoId}/${commentId}`);
      // Update comments state by filtering out the deleted comment
      setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
      alert('Comment deleted!');
      // Optional: fetchVideoDetails(); // You can still call this if needed
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const updateTitle = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URI}api/youtube/video/${videoId}`, { title: newTitle });
      alert('Title updated!');
      fetchVideoDetails();
    } catch (err) {
      console.error('Error updating title:', err);
    }
  };

  const startOAuth = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URI}auth/google`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="App">
      <button onClick={startOAuth}>Login with Google</button>
      <h1>YouTube Mini-App</h1>

      <div>
        <input
          type="text"
          placeholder="Enter YouTube Video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <button onClick={() => fetchVideoDetails(videoId)}>Fetch Video</button>
      </div>

      {videoDetails && (
        <div className="video-container">
          <div className="video-player">
            <img
              src={videoDetails.snippet.thumbnails.maxres.url}
              alt={videoDetails.snippet.title}
              className="video-thumbnail"
            />
          </div>
          <h2 className="video-title">{videoDetails.snippet.title}</h2>
          <div className="video-info">
            <div className="channel-info">
              <span className="channel-title">{videoDetails.snippet.channelTitle}</span>
            </div>
            <div className="publish-date">
              Published on {formatDate(videoDetails.snippet.publishedAt)}
            </div>
          </div>
          <div className="video-description">
            <p>{videoDetails.snippet.description || 'No description available'}</p>
          </div>
        </div>
      )}

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment.id}>
                <div className="comment-content">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">{formatDate(comment.publishedAt)}</span>
                  <p className="comment-text">{comment.text}</p>
                </div>
                <button onClick={() => deleteComment(comment.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments available</p>
        )}
      </div>

      <div>
        <h3>Add a Comment</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment here"
        />
        <button onClick={addComment}>Post Comment</button>
      </div>

      <div>
        <h3>Update Video Title</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New video title"
        />
        <button onClick={updateTitle}>Update Title</button>
      </div>
    </div>
  );
}

export default App;