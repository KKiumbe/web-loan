import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Modal,
  Paper,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getTheme } from '../store/theme';
import { useAuthStore } from '../store/authStore';
import TitleComponent from '../components/title';

const LoanRequestsScreen = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) return;
    fetchLoans();
  }, [currentUser]);

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pending-loans`, {
        withCredentials: true,
      });

      const flattened = res.data.data.map((loan) => ({
        ...loan,
        customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`,
        organizationName: loan.organization?.name || 'N/A',
      }));

      setLoans(flattened);
      console.log('Flattened loan requests:', flattened);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setSnackbar({ open: true, message: 'Failed to fetch loan requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLoan) return;
    try {
      await axios.patch(`${BASE_URL}/approve-loan/${selectedLoan.id}`, {}, { withCredentials: true });
      setSnackbar({ open: true, message: 'Loan approved successfully' });
      setModalOpen(false);
      fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      setSnackbar({ open: true, message: 'Failed to approve loan' });
    }
  };

  const handleReject = async () => {
    if (!selectedLoan) return;
    try {
      const res = await axios.put(
        `${BASE_URL}/reject-loan/${selectedLoan.id}`,
        { status: 'REJECTED' },
        { withCredentials: true }
      );
      setSnackbar({
        open: true,
        message: res.data.message || 'Loan rejected successfully',
        severity: 'success',
      });
      setModalOpen(false);
      fetchLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      const msg = error.response?.data?.message || 'Failed to reject loan';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedLoan(params.row);
            setModalOpen(true);
          }}
        >
          Review
        </Button>
      ),
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    { field: 'amount', headerName: 'Amount (KES)', width: 150, type: 'number' },
    { field: 'interestRate', headerName: 'Interest', width: 120, type: 'number' },
    { field: 'organizationName', headerName: 'Organization', width: 180 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'createdAt',
      headerName: 'Requested On',
      width: 180,
      valueGetter: (params) => {
        try {
          return params.row.createdAt
            ? new Date(params.row.createdAt).toLocaleString()
            : 'N/A';
        } catch {
          return 'Invalid Date';
        }
      },
    },
  ];

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Loan Requests" />
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <DataGrid
            rows={loans}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            disableSelectionOnClick
            sx={{ maxWidth: 1400, mx: 'auto' }}
          />
        </Paper>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Review Loan Request
          </Typography>
          {selectedLoan && (
            <>
              <Typography>Amount: KES {selectedLoan.amount}</Typography>
              <Typography>
                Customer: {selectedLoan.user?.firstName} {selectedLoan.user?.lastName}
              </Typography>
              <Typography>Organization: {selectedLoan.organization?.name}</Typography>
              <Typography>Status: {selectedLoan.status}</Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="success" onClick={handleApprove}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" onClick={handleReject}>
                  Reject
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default LoanRequestsScreen;
