import  { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  IconButton,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getTheme } from '../store/theme';
import TitleComponent from '../components/title';

export default function OrganizationAdminDetail() {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const BASEURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // Check if currentUser exists and has EMPLOYEE role
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Please log in to continue.',
        severity: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }


    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${BASEURL}/users/${id}`, { withCredentials: true });
        console.log(`user object ${JSON.stringify(res.data)}`);
        setAdmin(res.data.user);
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load admin details';
        setError(msg);
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [BASEURL, currentUser, id, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: theme.palette.greenAccent.main, mr: 1.5 }}
          >
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            <TitleComponent title="Admin Details" />
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh',
              width: '100%',
            }}
          >
            <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : error ? (
          <Typography
            sx={{ textAlign: 'center', color: theme.palette.error.main, fontSize: '0.9rem', mb: 2 }}
          >
            {error}
          </Typography>
        ) : admin ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              bgcolor: theme.palette.background.paper,
              width: '100%',
              transition: 'all 0.3s ease',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}
            >
              {admin.firstName} {admin.lastName}
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, fontSize: '0.9rem' }}>
              <Typography>
                <strong>ID:</strong> {admin.id}
              </Typography>
              <Typography>
                <strong>Email:</strong> {admin.email || 'N/A'}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {admin.phoneNumber || 'N/A'}
              </Typography>
              <Typography>
                <strong>Organization:</strong>{' '}
                {admin.organization?.name
                  ? `${admin.organization.name} (#${admin.organization.id})`
                  : 'N/A'}
              </Typography>
              {admin.organization?.interestRate !== undefined && (
                <Typography>
                  <strong>Interest Rate:</strong>{' '}
                  {(admin.organization.interestRate * 100).toFixed(2)}%
                </Typography>
              )}
              <Typography>
                <strong>Created At:</strong>{' '}
                {new Date(admin.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              <Typography>
                <strong>Updated At:</strong>{' '}
                {new Date(admin.updatedAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Typography
            sx={{ textAlign: 'center', color: theme.palette.text.secondary, fontSize: '0.9rem', mt: 2 }}
          >
            No admin data available
          </Typography>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette[snackbar.severity].main,
              color: theme.palette[snackbar.severity].contrastText,
              fontSize: '0.9rem',
              alignItems: 'center',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}