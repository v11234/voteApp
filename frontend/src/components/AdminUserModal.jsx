function AdminUserModal({ user, onClose, onApprove, approvingUserId }) {
  if (!user) {
    return null
  }

  const canApprove = typeof onApprove === 'function' && !user.isApproved

  return (
    <section className="modal" onClick={onClose}>
      <div className="modal_content admin_user-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal_header">
          <h4>User Review</h4>
          <button className="modal_close" type="button" onClick={onClose}>X</button>
        </header>

        <div className="admin_user-modal-grid">
          <p><strong>Full Name:</strong> {user.fullName || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Role:</strong> {user.role || 'voter'}</p>
          <p><strong>Status:</strong> {user.isApproved ? 'Approved' : 'Pending Approval'}</p>
          <p><strong>Email Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
          <p><strong>2FA Enabled:</strong> {user.twoFactorEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Face Enrolled:</strong> {user.faceRecognitionEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Face Enrolled At:</strong> {user.faceEnrolledAt ? new Date(user.faceEnrolledAt).toLocaleString() : 'N/A'}</p>
          <p><strong>ID Number:</strong> {user.idNumber || 'Not submitted'}</p>
          <p><strong>ID Verification:</strong> {user.idVerificationStatus || 'not_submitted'}</p>
          <p><strong>ID Submitted At:</strong> {user.idSubmittedAt ? new Date(user.idSubmittedAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}</p>
          <p><strong>User ID:</strong> {user._id}</p>
        </div>

        <div className="admin_user-modal-images">
          <div>
            <p><strong>Facial Recognition Image</strong></p>
            {user.faceImageData ? (
              <img src={user.faceImageData} alt={`${user.fullName || 'User'} face`} />
            ) : (
              <p className="admin_dashboard-id-missing">No face image available.</p>
            )}
          </div>

          <div>
            <p><strong>ID Card Upload</strong></p>
            {user.idCardUrl ? (
              <a href={user.idCardUrl} target="_blank" rel="noreferrer">
                <img src={user.idCardUrl} alt={`${user.fullName || 'User'} ID`} />
              </a>
            ) : (
              <p className="admin_dashboard-id-missing">No ID card uploaded.</p>
            )}
          </div>
        </div>

        <div className="admin_user-modal-actions">
          <button className="btn" type="button" onClick={onClose}>Close</button>
          {canApprove && (
            <button
              className="btn primary"
              type="button"
              disabled={approvingUserId === user._id}
              onClick={() => onApprove(user._id)}
            >
              {approvingUserId === user._id ? 'Approving...' : 'Approve User'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminUserModal
