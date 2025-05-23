import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
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
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  

    fetchLoans();
  }, [currentUser, navigate]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/loans`, { withCredentials: true });
      const rawGrouped = res.data || {};

      const flattenedGrouped = {};
      Object.entries(rawGrouped).forEach(([key, loans]) => {
        const typedLoans = Array.isArray(loans) ? (loans as any[]) : [];
        flattenedGrouped[key] = typedLoans.map((loan) => ({
          ...loan,
          customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.trim() || 'N/A',
          organizationName: loan.organization?.name || 'N/A',
          interestRate: loan.interestRate !== undefined ? (loan.interestRate * 100).toFixed(2) : 'N/A', // Convert to percentage
        }));
      });

      setGroupedLoans(flattenedGrouped);
      setFilteredLoans(flattenedGrouped[status] || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch loans',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
    setSearchQuery(''); // Reset search when changing tabs
    setFilteredLoans(groupedLoans[newValue] || []);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = (groupedLoans[status] || []).filter(
      (loan) =>
        loan.customerName.toLowerCase().includes(query) ||
        loan.organizationName.toLowerCase().includes(query) ||
        loan.id.toString().includes(query)
    );
    setFilteredLoans(filtered);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    {
      field: 'amount',
      headerName: 'Amount (KES)',
      width: 150,
      type: 'number',
      //valueFormatter: ({ value }) => value.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      field: 'interestRate',
      headerName: 'Interest (%)',
      width: 120,
      type: 'number',
      //valueFormatter: ({ value }) => (value !== 'N/A' ? `${value}%` : value),
    },
    { field: 'organizationName', headerName: 'Organization', width: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ color: loanStatusColors[value] || theme.palette.text.primary, fontWeight: 500 }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Requested On',
      width: 180,
      valueGetter: ({ row }) => {
        try {
          return row.createdAt ? new Date(row.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : 'N/A';
        } catch {
          return 'Invalid Date';
        }
      },
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
          <TitleComponent title="Loans" />
        </Typography>

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
        ) : (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              bgcolor: theme.palette.background.paper,
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Tabs
                value={status}
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="primary"
                sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem' } }}
              >
                {Object.keys(groupedLoans).map((key) => (
                  <Tab
                    key={key}
                    label={`${key} (${groupedLoans[key]?.length || 0})`}
                    value={key}
                    sx={{ color: loanStatusColors[key] || theme.palette.text.primary }}
                  />
                ))}
              </Tabs>
              <TextField
                placeholder="Search by ID, Customer, or Organization"
                value={searchQuery}
                onChange={handleSearch}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 300 }, borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
            <DataGrid
              rows={filteredLoans}
              columns={columns}
              getRowId={(row) => row.id}
              autoHeight
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': { fontSize: '0.9rem' },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
              }}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              localeText={{ noRowsLabel: 'No loans found' }}
            />
          </Paper>
        )}

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
};

export default LoansScreen;