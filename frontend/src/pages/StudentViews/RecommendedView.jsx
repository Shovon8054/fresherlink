import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedJobs } from '../../services/api';
import JobCard from '../../components/JobCard';
import styles from './StudentView.module.css';

export default function RecommendedView() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRecommended = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRecommendedJobs();
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecommended();
    }, [fetchRecommended]);

    if (loading) return <div className={styles.loading}>Finding best matches...</div>;

    return (
        <div className={styles.section}>
            <h2 className={styles.viewTitle}>Recommended For You</h2>
            <p className={styles.viewSubtitle}>Jobs matching your profile skills 🎯</p>
            
            {jobs.length === 0 ? (
                <div className={styles.emptyMessage}>
                    <p>No matches found yet.</p>
                    <button onClick={() => navigate('../profile')} className={styles.linkBtn}>
                        Update your skills to get better matches
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {jobs.map((job) => (
                        <JobCard
                            key={job._id}
                            job={job}
                            onView={(id) => navigate(`/jobs/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}