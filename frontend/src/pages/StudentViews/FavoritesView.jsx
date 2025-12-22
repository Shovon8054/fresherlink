import { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../../services/api';
import JobCard from '../../components/JobCard';
import { useNavigate } from 'react-router-dom';

export default function FavoritesView() {
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getFavorites().then(res => setFavorites(res.data));
    }, []);

    const handleRemove = async (id) => {
        if(window.confirm("Remove?")) {
            await removeFavorite(id);
            setFavorites(favorites.filter(j => j._id !== id));
        }
    };

    return (
        <div>
            <h2>Favorite Jobs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {favorites.map(job => (
                    <JobCard key={job._id} job={job} removeMode={true} onToggleFavorite={handleRemove} onView={(id) => navigate(`/jobs/${id}`)} />
                ))}
            </div>
        </div>
    );
}