import { useState, useEffect, useCallback } from 'react';
import { getMyApplications } from '../../services/api';
import styles from './StudentView.module.css';

export default function ApplicationsView() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMyApplications();
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'shortlisted': return styles.statusShortlisted;
            case 'rejected': return styles.statusRejected;
            default: return styles.statusPending;
        }
    };

    if (loading) return <div className={styles.loading}>Loading applications...</div>;

    return (
        <div className={styles.section}>
            <h2 className={styles.viewTitle}>My Applications</h2>
            {applications.length === 0 ? (
                <p className={styles.emptyMessage}>You haven't applied to any jobs yet.</p>
            ) : (
                <div className={styles.grid}>
                    {applications.map((app) => (
                        <div key={app._id} className={styles.appCard}>
                            <h3 className={styles.jobTitle}>{app.jobId?.title || 'Unknown Position'}</h3>
                            <div className={styles.appInfo}>
                                <p><strong>Company:</strong> {app.jobId?.company?.name || 'N/A'}</p>
                                <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                                <p className={styles.statusRow}>
                                    <strong>Status:</strong> 
                                    <span className={getStatusStyle(app.status)}>
                                        {app.status.toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}