import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const RANDOM_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80'
];

const AddMovieForm = ({ onMovieAdded, setMessage }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: 120,
    genre: 'Action',
    language: 'Hindi',
    releaseDate: todayStr,
    posterUrl: ''
  });

  const handleRandomPoster = () => {
    const randomUrl = RANDOM_POSTERS[Math.floor(Math.random() * RANDOM_POSTERS.length)];
    setMovieForm((prev) => ({ ...prev, posterUrl: randomUrl }));
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/movies/add', movieForm);
      if (res.data?.success) {
        setMessage({ type: 'success', text: '🎬 Movie added successfully!' });
        setMovieForm({
          title: '',
          description: '',
          duration: 120,
          genre: 'Action',
          language: 'Hindi',
          releaseDate: todayStr,
          posterUrl: ''
        });
        if (onMovieAdded) onMovieAdded();
      } else {
        setMessage({ type: 'danger', text: res.data?.message || 'Failed to add movie.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error adding movie.' });
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 rounded-3">
      <h4 className="fw-bold mb-3">Add New Movie</h4>
      <form onSubmit={handleAddMovie}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Movie Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Interstellar"
              required
              value={movieForm.title}
              onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Genre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Sci-Fi / Action"
              required
              value={movieForm.genre}
              onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Language</label>
            <input
              type="text"
              className="form-control"
              placeholder="English / Hindi"
              required
              value={movieForm.language}
              onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Duration (Mins)</label>
            <input
              type="number"
              className="form-control"
              required
              min="30"
              value={movieForm.duration}
              onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Release Date</label>
            <input
              type="date"
              className="form-control"
              required
              value={movieForm.releaseDate}
              onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
              <span>Poster Image URL</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-bold"
                onClick={handleRandomPoster}
              >
                🎲 Random Poster
              </button>
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://..."
              required
              value={movieForm.posterUrl}
              onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              className="form-control"
              rows="3"
              required
              value={movieForm.description}
              onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
            ></textarea>
          </div>

          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-danger fw-bold px-4">
              Save Movie
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMovieForm;