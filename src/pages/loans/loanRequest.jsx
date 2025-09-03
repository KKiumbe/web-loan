import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { getTheme } from '../../store/theme';
import TitleComponent from '../../components/title';

export default function LoanRequestsScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
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

    const fetchLoans = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/pending-loans`, { withCredentials: true });
        const flattened = res.data.data.map((loan) => ({
          ...loan,
          customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.trim() || 'N/A',
          organizationName: loan.organization?.name || 'N/A',
        }));
        setLoans(flattened);
      } catch (error) {
        console.error('Error fetching loans:', error);
        setSnackbar({ open: true, message: 'Failed to fetch loan requests', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [currentUser, navigate]);

  const handleOpenDialog = (loan, type) => {
    setSelectedLoan(loan);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLoan(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedLoan || !actionType) return;

    try {
      if (actionType === 'approve') {
        await axios.patch(`${BASE_URL}/approve-loan/${selectedLoan.id}`, {}, { withCredentials: true });
        setSnackbar({ open: true, message: 'Loan approved successfully', severity: 'success' });
      } else if (actionType === 'reject') {
        await axios.put(
          `${BASE_URL}/reject-loan/${selectedLoan.id}`,
          { status: 'REJECTED' },
          { withCredentials: true }
        );
        setSnackbar({ open: true, message: 'Loan rejected successfully', severity: 'success' });
      }
      handleCloseDialog();
      // Refresh loans
      const res = await axios.get(`${BASE_URL}/pending-loans`, { withCredentials: true });
      const flattened = res.data.data.map((loan) => ({
        ...loan,
        customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.trim() || 'N/A',
        organizationName: loan.organization?.name || 'N/A',
      }));
      setLoans(flattened);
    } catch (error) {
      console.error(`Error ${actionType}ing loan:`, error);
      const msg = error.response?.data?.message || `Failed to ${actionType} loan`;
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleOpenDialog(params.row, 'approve')}
            sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 500 }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleOpenDialog(params.row, 'reject')}
            sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 500 }}
          >
            Reject
          </Button>
        </Box>
      ),
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    {
      field: 'amount',
      headerName: 'Amount (KES)',
      width: 150,
      type: 'number',
     
    },
    {
      field: 'interestRate',
      headerName: 'Interest (%)',
      width: 120,
      type: 'number',
      
    },
    { field: 'organizationName', headerName: 'Organization', width: 180 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'createdAt',
      headerName: 'Requested On',
      width: 200,
      renderCell: (params) => {
        const value = params.row.createdAt;
        if (!value) return '—';
        try {
          return format(new Date(value), 'dd MMM yyyy, HH:mm');
        } catch {
          return '—';
        }
      },
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
  
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
      }}
    >
      <Box sx={{  mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 5 }}>
          <TitleComponent title="Loan Requests" />
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              bgcolor: theme.palette.background.paper,
              transition: 'all 0.3s ease',
            }}
          >
            <DataGrid
              rows={loans}
              columns={columns}
              getRowId={(row) => row.id}
              autoHeight
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-root': { borderRadius: 2 },
                '& .MuiDataGrid-cell': { fontSize: '1rem', color: theme.palette.text.primary },
                '& .MuiDataGrid-columnHeader': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.background.default,
                },
                '& .MuiDataGrid-row:hover': { bgcolor: theme.palette.action.hover },
              }}
            />
          </Paper>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="loan-action-dialog-title"
          aria-describedby="loan-action-dialog-description"
          sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle id="loan-action-dialog-title">
            {actionType === 'approve' ? 'Approve Loan' : 'Reject Loan'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="loan-action-dialog-description" sx={{ color: theme.palette.text.secondary }}>
              Are you sure you want to {actionType} the loan request for{' '}
              <strong>{selectedLoan?.customerName}</strong> (Amount: KES{' '}
              {selectedLoan?.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })})?
              {actionType === 'reject' && ' This action cannot be undone.'}
            </DialogContentText>
            {selectedLoan && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: '1rem', mb: 1, color: theme.palette.text.secondary }}>
                  <strong>Customer:</strong> {selectedLoan.customerName}
                </Typography>
                <Typography sx={{ fontSize: '1rem', mb: 1, color: theme.palette.text.secondary }}>
                  <strong>Amount:</strong> KES {selectedLoan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography sx={{ fontSize: '1rem', mb: 1, color: theme.palette.text.secondary }}>
                  <strong>Organization:</strong> {selectedLoan.organizationName}
                </Typography>
                <Typography sx={{ fontSize: '1rem', mb: 1, color: theme.palette.text.secondary }}>
                  <strong>Status:</strong> {selectedLoan.status}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
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
              onClick={handleConfirmAction}
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: theme.palette[actionType === 'approve' ? 'success' : 'error'].dark },
              }}
              autoFocus
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

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