import { useState, useEffect, useCallback } from 'react';
import { useCard } from '../../App';
import { getProfile, updateProfile } from '../../services/api';
import styles from './StudentView.module.css';
//import dop from '../../assets/none_dp.png'  

export default function ProfileView() {
    const showCard = useCard();
    // UI States
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form / display states
    const [name, setName] = useState('');
    const [headline, setHeadline] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [permanentLocation, setPermanentLocation] = useState('');

    // Education
    const [eduInstitution, setEduInstitution] = useState('');
    const [eduDegree, setEduDegree] = useState('');
    const [eduMajor, setEduMajor] = useState('');
    const [eduGraduationYear, setEduGraduationYear] = useState('');
    const [eduCgpa, setEduCgpa] = useState('');
    const [eduExtraCurricular, setEduExtraCurricular] = useState('');

    // Experience
    const [experience, setExperience] = useState('');

    // Social links
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [portfolio, setPortfolio] = useState('');

    // Skills (comma-separated inputs)
    const [technicalSkillsText, setTechnicalSkillsText] = useState('');
    const [softSkillsText, setSoftSkillsText] = useState('');

    const [photo, setPhoto] = useState(null);
    const [resume, setResume] = useState(null);

    // 1. Declare fetchProfile first
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            const data = response.data;

            setProfile(data);
            setName(data.name || '');
            setHeadline(data.headline || '');
            setPhoneNumber(data.phoneNumber || '');
            setCurrentLocation(data.currentLocation || '');
            setPermanentLocation(data.permanentLocation || '');

            // Education object
            setEduInstitution(data.education?.institution || '');
            setEduDegree(data.education?.degree || '');
            setEduMajor(data.education?.major || '');
            setEduGraduationYear(data.education?.graduationYear || '');
            setEduCgpa(data.education?.cgpa || '');
            setEduExtraCurricular(data.education?.extraCurricular || '');

            setExperience(data.experience || 'N/A');

            setGithub(data.socialLinks?.github || '');
            setLinkedin(data.socialLinks?.linkedin || '');
            setPortfolio(data.socialLinks?.portfolio || '');

            setTechnicalSkillsText((data.technicalSkills && data.technicalSkills.join(', ')) || '');
            setSoftSkillsText((data.softSkills && data.softSkills.join(', ')) || '');

            setIsEditing(false);
        } catch (e) {
            console.log('No profile yet or error fetching', e);
            setProfile(null);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('name', name);
        formData.append('headline', headline);
        formData.append('phoneNumber', phoneNumber);
        formData.append('currentLocation', currentLocation);
        formData.append('permanentLocation', permanentLocation);

        // Education as JSON
        const education = {
            institution: eduInstitution,
            degree: eduDegree,
            major: eduMajor,
            graduationYear: eduGraduationYear,
            cgpa: eduCgpa,
            extraCurricular: eduExtraCurricular
        };
        formData.append('education', JSON.stringify(education));

        // Experience
        if (experience) formData.append('experience', JSON.stringify(experience));

        // Social links
        const socialLinks = { github, linkedin, portfolio };
        formData.append('socialLinks', JSON.stringify(socialLinks));

        // Skills -> arrays
        const techArray = technicalSkillsText.split(',').map(s => s.trim()).filter(Boolean);
        const softArray = softSkillsText.split(',').map(s => s.trim()).filter(Boolean);
        formData.append('technicalSkills', JSON.stringify(techArray));
        formData.append('softSkills', JSON.stringify(softArray));

        if (photo) formData.append('photo', photo);
        if (resume) formData.append('resume', resume);

        try {
            const response = await updateProfile(formData);
            setProfile(response.data.profile || response.data);
            setIsEditing(false);
            showCard('Profile updated successfully!', 'info');
        } catch (e) {
            console.error('Error updating profile', e);
            showCard(e.response?.data?.message || 'Error updating profile', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Loading profile...</div>;

    return (
        <div className={styles.section}>
            {profile && !isEditing ? (
                /* DISPLAY MODE */
                <div className={styles.profileCard}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: '0 0 120px' }}>
                            {profile.photo ? (
                                <img
                                    src={`http://localhost:8080/${(profile.photo && profile.photo.startsWith('uploads/')) ? profile.photo : `uploads/profile_pictures/${profile.photo}`}`}
                                    className={styles.avatar}
                                    alt="Profile"
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>{(profile.name || 'U').charAt(0)}</div>
                            )}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h2 style={{ margin: 0 }}>{profile.name}</h2>
                            <p style={{ margin: '6px 0', color: '#374151' }}>{profile.headline || ''}</p>
                            <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {profile.phoneNumber || 'Not provided'}</p>
                            <p style={{ margin: '4px 0' }}><strong>Current:</strong> {profile.currentLocation || 'Not provided'}</p>
                            <p style={{ margin: '4px 0' }}><strong>Permanent:</strong> {profile.permanentLocation || 'Not provided'}</p>

                            <div style={{ marginTop: '12px' }}>
                                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>Edit Profile</button>
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '16px 0' }} />

                    <div>
                        <h3 className={styles.sectionTitle}>Education</h3>
                        <p><strong>Institution:</strong> {profile.education?.institution || 'Not provided'}</p>
                        <p><strong>Degree:</strong> {profile.education?.degree || 'Not provided'}</p>
                        <p><strong>Major:</strong> {profile.education?.major || 'Not provided'}</p>
                        <p><strong>Graduation Year:</strong> {profile.education?.graduationYear || 'Not provided'}</p>
                        <p><strong>CGPA:</strong> {profile.education?.cgpa || 'Not provided'}</p>
                        <p><strong>Extra Curricular:</strong> {profile.education?.extraCurricular || 'None'}</p>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <h3 className={styles.sectionTitle}>Experience</h3>
                        <p>{profile.experience || 'N/A'}</p>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <h3 className={styles.sectionTitle}>Social Links</h3>
                        <p>{profile.socialLinks?.github ? (<a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>) : 'GitHub: Not provided'}{' '}|{' '}{profile.socialLinks?.linkedin ? (<a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>) : 'LinkedIn: Not provided'}{' '}|{' '}{profile.socialLinks?.portfolio ? (<a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>) : 'Portfolio: Not provided'}</p>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <h3 className={styles.sectionTitle}>Skills</h3>
                        <div className={styles.skillsRow}>
                            {(profile.technicalSkills || []).map((s, i) => (
                                <div key={i} className={styles.badgeTechnical}>{s}</div>
                            ))}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <strong>Soft skills:</strong>
                            {profile.softSkills && profile.softSkills.length > 0 ? (
                                <ul className={styles.softSkillList}>
                                    {profile.softSkills.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            ) : ' Not provided'}
                        </div>

                        {profile.resume && (
                            <p style={{ marginTop: '12px' }}>
                                <strong>Resume:</strong>{' '}
                                <a
                                    href={`http://localhost:8080/${(profile.resume && profile.resume.startsWith('uploads/')) ? profile.resume : `uploads/resumes/${profile.resume}`}`}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    View Resume
                                </a>
                            </p>
                        )}
                    </div>
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
                        <label>Professional Headline</label>
                        <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g., Fullstack Developer" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+880 111 111 1111" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Current Location</label>
                        <input type="text" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Permanent Location</label>
                        <input type="text" value={permanentLocation} onChange={(e) => setPermanentLocation(e.target.value)} />
                    </div>

                    <hr />

                    <h3 className={styles.sectionTitle}>Education</h3>
                    <div className={styles.inputGroup}>
                        <label>Institution</label>
                        <input type="text" value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Degree</label>
                        <input type="text" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Major / Department</label>
                        <input type="text" value={eduMajor} onChange={(e) => setEduMajor(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Graduation Year</label>
                        <input type="text" value={eduGraduationYear} onChange={(e) => setEduGraduationYear(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>CGPA</label>
                        <input type="text" value={eduCgpa} onChange={(e) => setEduCgpa(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Extra Curricular</label>
                        <input type="text" value={eduExtraCurricular} onChange={(e) => setEduExtraCurricular(e.target.value)} />
                    </div>

                    <hr />

                    <h3 className={styles.sectionTitle}>Experience</h3>
                    <div className={styles.inputGroup}>
                        <label>Experience</label>
                        <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Describe your experience (or N/A)" />
                    </div>

                    <hr />

                    <h3 className={styles.sectionTitle}>Social Links</h3>
                    <div className={styles.inputGroup}><label>GitHub</label><input type="url" value={github} onChange={(e) => setGithub(e.target.value)} /></div>
                    <div className={styles.inputGroup}><label>LinkedIn</label><input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></div>
                    <div className={styles.inputGroup}><label>Portfolio</label><input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} /></div>

                    <hr />

                    <h3 className={styles.sectionTitle}>Skills</h3>
                    <div className={styles.inputGroup}>
                        <label>Technical Skills (comma separated)</label>
                        <input type="text" value={technicalSkillsText} onChange={(e) => setTechnicalSkillsText(e.target.value)} placeholder="React, Node, MongoDB" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Soft Skills (comma separated)</label>
                        <input type="text" value={softSkillsText} onChange={(e) => setSoftSkillsText(e.target.value)} placeholder="Communication, Teamwork" />
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