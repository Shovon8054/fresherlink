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

  return (
    <div>
      <h2>Company Profile</h2>

      {!profile && !isEditing && (
        <div>
          <p>No profile created yet.</p>
          <button onClick={() => setIsEditing(true)}>Create Profile</button>
        </div>
      )}

      {profile && !isEditing && (
        <div>
          {profile.logo && (
            <img src={`http://localhost:5000/${profile.logo.startsWith('uploads/') ? profile.logo : `uploads/logos/${profile.logo}`}`} alt="Logo" style={{ width: 150 }} />
          )}
          <p><strong>Company Name:</strong> {profile.companyName}</p>
          <p><strong>Description:</strong> {profile.description}</p>
          <p><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a></p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={onSubmit} style={{ maxWidth: 700 }}>
          <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 100 }} />
          <input type="url" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
          </div>
          <div>
            <button type="submit" style={{ marginRight: 8 }}>Save</button>
            <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
} 
