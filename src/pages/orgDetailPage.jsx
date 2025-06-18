import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../components/title';
import { getTheme } from '../store/theme';
import { useAuthStore } from '../store/authStore';
import EditIcon from '@mui/icons-material/Edit';

export default function OrganizationDetailScreen() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Please log in to continue.',
        severity: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchOrg = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/organizations/${orgId}`, { withCredentials: true });
        setOrganization(res.data);
      } catch (err) {
        console.error('Failed to load organization:', err);
        const msg = err.response?.data?.error || 'Failed to fetch organization';
        setError(msg);
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [orgId, currentUser, navigate, BASE_URL]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: theme.palette.background.default,
          p: 4,
        }}
      >
        <Typography sx={{ color: theme.palette.error.main, fontSize: '0.9rem', mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            color: theme.palette.greenAccent.main, borderColor: theme.palette.greenAccent.main,
            ':hover': {
              backgroundColor: theme.palette.greenAccent.light,
              color: theme.palette.greenAccent.dark,
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const {
    name,
    approvalSteps,
    loanLimitMultiplier,
    interestRate,
    tenant,
    users,
    loans,
    repayments,
    Employee: employees,
    PaymentBatch: batches,
    createdAt,
  } = organization;

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw' }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            <TitleComponent title={`Organization: ${name}`} />
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/organizations/edit/${orgId}`)}
              startIcon={<EditIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.greenAccent.main,
                color: theme.palette.greenAccent.main,
                ':hover': { borderColor: theme.palette.secondary.light, color: theme.palette.primary.light },
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/organizations')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                 borderColor: theme.palette.greenAccent.main,
                color: theme.palette.greenAccent.main,
                ':hover': { borderColor: theme.palette.secondary.light, color: theme.palette.primary.light },
              }}
            >
              Back to Organizations
            </Button>
          </Box>
        </Box>

        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.background.paper,
            mb: 4,
            width: '100%',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Name:</strong> {name}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Approval Steps:</strong> {approvalSteps}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Loan Limit Multiplier:</strong> {loanLimitMultiplier?.toFixed(2) || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Interest Rate:</strong>{' '}
                {interestRate !== undefined ? `${(interestRate * 100).toFixed(2)}%` : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Tenant:</strong> {tenant?.name || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Created At:</strong>{' '}
                {new Date(createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Users:</strong> {users?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Employees:</strong> {employees?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Loans:</strong> {loans?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Repayments:</strong> {repayments?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                <strong>Payment Batches:</strong> {batches?.length || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.background.paper,
            width: '100%',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Recent Loans
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
          {loans?.length ? (
            <List dense>
              {loans.slice(-5).map((loan) => (
                <ListItem
                  key={loan.id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    ':hover': { bgcolor: theme.palette.action.hover },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        Loan #{loan.id} - KES {loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                        Status: {loan.status}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary, textAlign: 'center' }}>
              No loans available
            </Typography>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
