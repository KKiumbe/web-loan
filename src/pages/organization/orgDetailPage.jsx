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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function OrganizationDetailScreen() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/delete-org/${orgId}`, { withCredentials: true });
      setSnackbar({
        open: true,
        message: 'Organization deleted successfully',
        severity: 'success',
      });
      setTimeout(() => navigate('/organizations'), 2000);
    } catch (err) {
      console.error('Failed to delete organization:', err);
      const msg = err.response?.data?.error || 'Failed to delete organization';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: theme.palette.background.default,
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
        <Typography sx={{ color: theme.palette.error.main, fontSize: '1rem', mb: 3, fontWeight: 500 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            bgcolor: theme.palette.greenAccent.main,
            color: theme.palette.greenAccent.contrastText,
            '&:hover': {
              bgcolor: theme.palette.greenAccent.light,
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: theme.palette.background.default,
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            <TitleComponent title={`Organization: ${name}`} />
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/edit-org/${orgId}`)}
              startIcon={<EditIcon />}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.greenAccent.main,
                color: theme.palette.greenAccent.main,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: theme.palette.greenAccent.dark,
                  color: theme.palette.greenAccent.dark,
                },
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDeleteDialog}
              startIcon={<DeleteIcon />}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  color: theme.palette.error.dark,
                },
              }}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/organizations')}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.greenAccent.main,
                color: theme.palette.greenAccent.main,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: theme.palette.greenAccent.dark,
                  color: theme.palette.greenAccent.dark,
                },
              }}
            >
              Back to Organizations
            </Button>
          </Box>
        </Box>

        {/* Organization Details */}
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            bgcolor: theme.palette.background.paper,
            mb: 4,
            transition: 'all 0.3s ease',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
            Organization Details
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Name:</strong> {name}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Approval Steps:</strong> {approvalSteps}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Loan Limit Multiplier:</strong> {loanLimitMultiplier?.toFixed(2) || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Interest Rate:</strong>{' '}
                {interestRate !== undefined ? `${(interestRate * 100).toFixed(2)}%` : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
               
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Created At:</strong>{' '}
                {new Date(createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Users:</strong> {users?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Employees:</strong> {employees?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Loans:</strong> {loans?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Repayments:</strong> {repayments?.length || 0}
              </Typography>
              <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
                <strong>Payment Batches:</strong> {batches?.length || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Loans */}
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            bgcolor: theme.palette.background.paper,
            transition: 'all 0.3s ease',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
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
                    p: 2,
                    '&:hover': { bgcolor: theme.palette.action.hover },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: theme.palette.text.primary }}>
                        Loan #{loan.id} - KES {loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }}>
                        Status: {loan.status}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ fontSize: '1rem', color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
              No loans available
            </Typography>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle id="delete-dialog-title">Delete Organization</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description" sx={{ color: theme.palette.text.secondary }}>
              Are you sure you want to permanently delete the organization <strong>{name}</strong>? This action cannot be
              undone and will remove all associated data, including employees, loans, and repayments.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: theme.palette.action.hover },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: theme.palette.error.dark },
              }}
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              borderRadius: 8,
              bgcolor: theme.palette[snackbar.severity].main,
              color: theme.palette[snackbar.severity].contrastText,
              fontSize: '1rem',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}