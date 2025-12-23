import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, deleteAccount, forgotPassword, resetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PrivacyPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // OTP Reset State
    const [otpStep, setOtpStep] = useState(0); // 0: initial, 1: otp input
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getProfile();
                setProfileData(response.data);
            } catch (error) {
                console.error("Failed to load privacy data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            logout();
            navigate('/');
            alert('Account deleted successfully.');
        } catch (error) {
            console.error(error);
            alert('Failed to delete account. Please try again.');
        }
    };

    const handleSendOTP = async () => {
        const userEmail = profileData?.userId?.email;
        if (!userEmail) return alert('Email not found. Cannot send OTP.');
        try {
            setResetLoading(true);
            await forgotPassword(userEmail);
            setOtpStep(1);
            alert('OTP sent to your email!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending OTP');
        } finally {
            setResetLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const userEmail = profileData?.userId?.email;
        try {
            setResetLoading(true);
            await resetPassword({ email: userEmail, otp, newPassword });
            alert('Password reset successfully!');
            setOtpStep(0);
            setOtp('');
            setNewPassword('');
        } catch (error) {
            alert(error.response?.data?.message || 'Error resetting password');
        } finally {
            setResetLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h2 style={{ marginBottom: '24px' }}>Privacy Settings</h2>

            {/* EMAIL SECTION */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Registered Email</label>
                <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #e5e7eb', color: '#555' }}>
                    {profileData?.userId?.email || 'Loading...'}
                </div>
            </div>

            {/* PASSWORD RESET SECTION */}
            <hr style={{ margin: '24px 0', borderColor: '#eee' }} />
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Password Security</h3>

            {otpStep === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <div style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                            ********
                        </div>
                    </div>
                    <button
                        onClick={handleSendOTP}
                        disabled={resetLoading}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        {resetLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleResetPassword} style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Reset Password</h4>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Enter OTP</label>
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="submit"
                            disabled={resetLoading}
                            style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {resetLoading ? 'Verifying...' : 'Confirm New Password'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setOtpStep(0)}
                            style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* DELETE ACCOUNT SECTION */}
            <hr style={{ margin: '24px 0', borderColor: '#eee' }} />
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#ef4444' }}>Danger Zone</h3>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                Once you delete your account, there is no going back. Please be certain.
            </p>

            <button
                onClick={() => setShowDeleteModal(true)}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Delete Account
            </button>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ marginTop: 0, color: '#ef4444' }}>Delete Account?</h3>
                        <p>Are you sure you want to delete your account permanently? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Yes, Delete It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
