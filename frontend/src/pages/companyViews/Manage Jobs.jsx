import { deleteJob } from "../../services/api";

export default function ManageJobs({ startEditJob, jobs, onJobDeleted }) {
  // Jobs are passed from parent, no need to fetch

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJob(jobId);
      onJobDeleted(jobId); // Notify parent to update jobs list
      alert("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Manage Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {jobs.map((job) => (
            <div
              key={job._id}
              style={{
                border: "1px solid #e5e7eb",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "10px",
                  fontSize: "1.1rem",
                  color: "#111827",
                }}
              >
                {job.title}
              </h3>

              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  marginBottom: "15px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Type:</strong> {job.type}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Location:</strong> {job.location}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Posted:</strong>{" "}
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button
                  onClick={() => startEditJob && startEditJob(job)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    flex: 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    flex: 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#ef4444")
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
