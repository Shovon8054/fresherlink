import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '../../services/api';
import styles from './StudentView.module.css';
//import dop from '../../assets/none_dp.png'  

export default function ProfileView() {
    // UI States
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [department, setDepartment] = useState('');
    const [skills, setSkills] = useState('');
    const [photo, setPhoto] = useState(null);
    const [resume, setResume] = useState(null);

    // 1. Declare fetchProfile first (useCallback prevents cascading render errors)
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            const data = response.data;
            
            setProfile(data);
            setName(data.name || '');
            setInstitution(data.institution || '');
            setDepartment(data.department || '');
            setSkills(data.skills ? data.skills.join(', ') : '');
            setIsEditing(false);
        } catch (error) {
            console.log('No profile yet or error fetching');
            setProfile(null);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. useEffect comes after function declaration
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('institution', institution);
        formData.append('department', department);
        
        // Convert skills string to array
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        formData.append('skills', JSON.stringify(skillsArray));
        
        if (photo) formData.append('photo', photo);
        if (resume) formData.append('resume', resume);

        try {
            const response = await updateProfile(formData);
            setProfile(response.data.profile || response.data);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Error updating profile');
        }
    };

    if (loading) return <div className={styles.loading}>Loading profile...</div>;

    return (
        <div className={styles.section}>
            {profile && !isEditing ? (
                /* DISPLAY MODE */
                <div className={styles.profileDisplay}>
                    <div className={styles.profileHeader}>
                        {profile.photo ? (
                            <img 
                                src={`http://localhost:8080/${(profile.photo && profile.photo.startsWith('uploads/')) ? profile.photo : `uploads/profile_pictures/${profile.photo}`}`} 
                                className={styles.avatar} 
                                alt= "Profile"
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>{name.charAt(0)}</div>
                        )}
                        <div>
                            <h2 className={styles.userName}>{profile.name}</h2>
                            <p className={styles.userSubtitle}>{profile.department}</p>
                        </div>
                    </div>

                    <div className={styles.profileDetails}>
                        <p><strong>Institution:</strong> {profile.institution}</p>
                        <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'No skills added'}</p>
                        {profile.resume && (
                            <p>
                                <strong>Resume:</strong>{' '}
                                <a 
                                    href={`http://localhost:8080/${(profile.resume && profile.resume.startsWith('uploads/')) ? profile.resume : `uploads/resumes/${profile.resume}`}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.resumeLink}
                                >
                                    View Resume PDF
                                </a>
                            </p>
                        )}
                    </div>
                    
                    <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                        Edit Profile
                    </button>
                </div>
            ) : (
                /* EDIT MODE */
                <form onSubmit={handleUpdateProfile} className={styles.form}>
                    <h2 className={styles.formTitle}>{profile ? 'Edit Profile' : 'Create Profile'}</h2>
                    
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Institution</label>
                        <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Department</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Skills (comma separated)</label>
                        <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node, CSS" />
                    </div>

                    <div className={styles.fileGroup}>
                        <label>Profile Photo</label>
                        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
                    </div>

                    <div className={styles.fileGroup}>
                        <label>Resume (PDF)</label>
                        <input type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} />
                    </div>

                    <div className={styles.buttonActions}>
                        <button type="submit" className={styles.saveBtn}>Save Profile</button>
                        {profile && (
                            <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}