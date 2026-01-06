import React, { useState, useEffect } from 'react';

export default function CompanyProfile({ profile, fetchProfile, handleUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setDescription(profile.description || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const formatWebsite = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 27) + '...' : url;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('companyName', companyName);
    fd.append('description', description);
    fd.append('website', website);
    if (logo) fd.append('logo', logo);

    await handleUpdateProfile(fd);
    setIsEditing(false);
    fetchProfile();
  };

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px dashed #d1d5db',
    },
    emptyText: {
      fontSize: '18px',
      color: '#6b7280',
      marginBottom: '20px',
    },
    profileCard: {
      display: 'flex',
      gap: '32px',
      alignItems: 'flex-start',
    },
    logoContainer: {
      flexShrink: 0,
    },
    logo: {
      width: '140px',
      height: '140px',
      borderRadius: '12px',
      objectFit: 'cover',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    profileInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    description: {
      fontSize: '16px',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '20px',
    },
    websiteButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '8px 16px',
      color: '#374151',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
      },
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb',
    },
    button: {
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      ':hover': {
        backgroundColor: '#2563eb',
      },
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      ':hover': {
        backgroundColor: '#e5e7eb',
      },
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
    textarea: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
    fileInput: {
      padding: '12px 0',
      fontSize: '14px',
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Company Profile</h2>
      </div>

      {!profile && !isEditing && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No profile created yet</p>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            Create Profile
          </button>
        </div>
      )}

      {profile && !isEditing && (
        <div>
          <div style={styles.profileCard}>
            {profile.logo && (
              <div style={styles.logoContainer}>
                <img 
                  src={`http://localhost:8080/${profile.logo.startsWith('uploads/') ? profile.logo : `uploads/logos/${profile.logo}`}`} 
                  alt="Company Logo" 
                  style={styles.logo} 
                />
              </div>
            )}
            <div style={styles.profileInfo}>
              <h3 style={styles.companyName}>{profile.companyName}</h3>
              <p style={styles.description}>{profile.description}</p>
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noreferrer"
                  style={styles.websiteButton}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {formatWebsite(profile.website)}
                </a>
              )}
            </div>
          </div>
          <div style={styles.actions}>
            <button 
              onClick={() => setIsEditing(true)}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Name *</label>
            <input 
              type="text" 
              placeholder="Enter company name" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description *</label>
            <textarea 
              placeholder="Describe your company" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              style={styles.textarea} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Website</label>
            <input 
              type="url" 
              placeholder="https://example.com" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)} 
              style={styles.input} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Logo</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setLogo(e.target.files[0])} 
              style={styles.fileInput}
            />
            <small style={{ color: '#6b7280', fontSize: '13px' }}>
              Upload a logo image (JPG, PNG, or GIF)
            </small>
          </div>

          <div style={styles.formActions}>
            <button 
              type="submit" 
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={() => { setIsEditing(false); fetchProfile(); }}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}