import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
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
      navigate('/login');
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
    <Container sx={{ py: 4, maxWidth: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: theme.palette.greenAccent.main, mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          <TitleComponent title="Admin Details" />
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: '0.875rem' }}>
          {error}
        </Typography>
      ) : admin ? (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {admin.firstName} {admin.lastName}
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>ID:</strong> {admin.id}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>Email:</strong> {admin.email || 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>Phone:</strong> {admin.phoneNumber || 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>Organization:</strong>{' '}
              {admin.organization?.name ? `${admin.organization.name} (#${admin.organization.id})` : 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>Created At:</strong>{' '}
              {new Date(admin.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>
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
        <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
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
          sx={{ borderRadius: 2, backgroundColor: theme.palette[snackbar.severity].main, color: '#fff' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}