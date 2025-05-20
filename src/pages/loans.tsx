import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getTheme } from '../store/theme';
import { useAuthStore } from '../store/authStore';
import TitleComponent from '../components/title';

const loanStatusColors = {
  PENDING: '#FFA500',
  APPROVED: '#4CAF50',
  REJECTED: '#F44336',
  DISBURSED: '#2196F3',
  REPAID: '#9C27B0',
};

const LoansScreen = () => {
  const [groupedLoans, setGroupedLoans] = useState({});
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
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
      const res = await axios.get(`${BASE_URL}/loans`, { withCredentials: true });
      const rawGrouped = res.data;

      const flattenedGrouped = {};
      Object.entries(rawGrouped).forEach(([key, loans]) => {
        flattenedGrouped[key] = loans.map((loan) => ({
          ...loan,
          customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`,
          organizationName: loan.organization?.name || 'N/A',
        }));
      });

      setGroupedLoans(flattenedGrouped);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setSnackbar({ open: true, message: 'Failed to fetch loans' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
  };

  const columns = [
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
          return params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : 'N/A';
        } catch {
          return 'Invalid Date';
        }
      },
    },
  ];

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Loans" />
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Tabs value={status} onChange={handleTabChange} sx={{ mb: 2 }} textColor="inherit" indicatorColor="primary">
            {Object.keys(groupedLoans).map((key) => (
              <Tab
                key={key}
                label={key}
                value={key}
                sx={{ color: loanStatusColors[key] || 'inherit', fontWeight: 'bold' }}
              />
            ))}
          </Tabs>

          <Paper>
            <DataGrid
              rows={groupedLoans[status] || []}
              columns={columns}
              getRowId={(row) => row.id}
              autoHeight
              disableSelectionOnClick
              sx={{ maxWidth: 1400, mx: 'auto' }}
            />
          </Paper>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default LoansScreen;
