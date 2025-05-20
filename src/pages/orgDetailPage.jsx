import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../components/title';
import { getTheme } from '../store/theme';

export default function OrganizationDetailScreen() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const theme = getTheme();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/organizations/${orgId}`,
          { withCredentials: true }
        );
        setOrganization(res.data);
      } catch (err) {
        console.error('Failed to load organization:', err);
        const msg = err.response?.data?.error || 'Failed to fetch organization';
        setError(msg);
        setSnackbar({ open: true, message: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [orgId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
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
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          <TitleComponent title={`Organization: ${name}`} />
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/organizations')}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography><strong>Name:</strong> {name}</Typography>
            <Typography><strong>Approval Steps:</strong> {approvalSteps}</Typography>
            <Typography><strong>Loan Limit Multiplier:</strong> {loanLimitMultiplier}</Typography>
            <Typography><strong>Interest Rate (%):</strong> {interestRate}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Tenant:</strong> {tenant?.name || '—'}</Typography>
            <Typography><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</Typography>
            <Typography><strong>Users:</strong> {users?.length}</Typography>
            <Typography><strong>Employees:</strong> {employees?.length}</Typography>
            <Typography><strong>Loans:</strong> {loans?.length}</Typography>
            <Typography><strong>Repayments:</strong> {repayments?.length}</Typography>
            <Typography><strong>Payment Batches:</strong> {batches?.length}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Loans
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loans?.length ? (
          <List dense>
            {loans.slice(-5).map((loan) => (
              <ListItem key={loan.id} button>
                <ListItemText
                  primary={`Loan #${loan.id} - Amount: KES ${loan.amount}`}
                  secondary={`Status: ${loan.status}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No loans available.</Typography>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
