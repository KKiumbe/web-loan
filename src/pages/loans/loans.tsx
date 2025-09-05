import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';
import TitleComponent from '../../components/title';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

const loanStatusColors = {
  PENDING: '#FFA500',
  APPROVED: '#4CAF50',
  REJECTED: '#F44336',
  DISBURSED: '#2196F3',
  REPAID: '#9C27B0',
  UNKNOWN: '#757575',
};

const LoansScreen = () => {
  const [groupedLoans, setGroupedLoans] = useState<Record<string, any[]>>({});
const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);

  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [stats, setStats] = useState({
    totalLoans: 0,
    loansThisMonth: 0,
    statusCountsThisMonth: {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      REPAID: 0,
      DISBURSED: 0,
    },
    disbursedPercentageThisMonth: 0,
  });

  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) {
      setSnackbar({ open: true, message: 'Please log in to continue.', severity: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    fetchOrganizations();
    fetchAllLoans();
  }, [currentUser, navigate]);

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/organizations`, { withCredentials: true });
      const orgs = Array.isArray(res.data) ? res.data : [];
      console.log('Organizations:', orgs);
      setOrganizations(orgs);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setSnackbar({ open: true, message: 'Failed to load organizations', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/get-all-loans`, { withCredentials: true });
      console.log('fetchAllLoans response:', res.data);
      const loans = Array.isArray(res.data.loans) ? res.data.loans : [];
      if (!loans.length) {
        console.warn('No loans returned from API');
        setSnackbar({ open: true, message: 'No loans found', severity: 'info' });
      }
      groupAndSetLoans(loans);
      setStats({
        totalLoans: 0,
        loansThisMonth: 0,
        statusCountsThisMonth: { PENDING: 0, APPROVED: 0, REJECTED: 0, REPAID: 0, DISBURSED: 0 },
        disbursedPercentageThisMonth: 0,
      });
    } catch (error) {
      console.error('fetchAllLoans error:', error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch loans',
        severity: 'error',
      });
      setGroupedLoans({});
      setFilteredLoans([]);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoansForOrg = async (orgId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/loans/organization/${orgId}`, { withCredentials: true });
      console.log('fetchLoansForOrg response:', res.data);
      const loans = Array.isArray(res.data.loans) ? res.data.loans : [];
      if (!loans.length) {
        console.warn('No loans returned for organization:', orgId);
        setSnackbar({ open: true, message: 'No loans found for this organization', severity: 'info' });
      }
      groupAndSetLoans(loans);
      setStats(res.data.stats || {
        totalLoans: 0,
        loansThisMonth: 0,
        statusCountsThisMonth: { PENDING: 0, APPROVED: 0, REJECTED: 0, REPAID: 0, DISBURSED: 0 },
        disbursedPercentageThisMonth: 0,
      });
    } catch (error) {
      console.error('fetchLoansForOrg error:', error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch organization loans',
        severity: 'error',
      });
      setGroupedLoans({});
      setFilteredLoans([]);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const groupAndSetLoans = (loansArray) => {
    const grouped = {};
    loansArray.forEach((loan) => {
      if (!loan || !loan.id) {
        console.warn('Invalid loan object:', loan);
        return;
      }

      const statusKey = loan.status || 'UNKNOWN';
      if (!grouped[statusKey]) grouped[statusKey] = [];

      const organizationName =
        loan.organization?.name ||
        loan.user?.employee?.organization?.name ||
        'N/A';

      if (!loan.user) console.warn('Loan missing user:', loan.id);
      if (!organizationName) console.warn('Loan missing organization:', loan.id);

      grouped[statusKey].push({
        ...loan,
        customerName: `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.trim() || 'N/A',
        phoneNumber: loan.user?.phoneNumber || 'N/A',
        email: loan.user?.email || 'N/A',
        organizationName,
        interestRate: loan.interestRate !== undefined ? (loan.interestRate * 100).toFixed(2) : 'N/A',
        createdAt: loan?.createdAt || null,
        duration: loan.duration || null,
        mpesaStatus: loan.mpesaStatus || 'N/A',
        disbursementDate: loan?.disbursedAt || null,
        loanPayout: loan.LoanPayout?.status || null,
        mpesaTrasactionId: loan.mpesaTransactionId || 'N/A',
      });
    });

    console.log('Grouped loans:', grouped);
    setGroupedLoans(grouped);
    const firstStatus = Object.keys(grouped).length > 0 ? Object.keys(grouped)[0] : '';
    setStatus(firstStatus);
    setFilteredLoans(grouped[firstStatus] || []);
  };

  interface Loan {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  // Add other loan properties here
}

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setSearchQuery('');
    if (newStatus === 'ALL') {
      setFilteredLoans(Object.values(groupedLoans).flat() as any[]);
    } else {
      setFilteredLoans(groupedLoans[newStatus] || []);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    { field: 'phoneNumber', headerName: 'Phone Number', width: 180 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'amount', headerName: 'Amount (KES)', width: 150, type: 'number' },
    { field: 'interestRate', headerName: 'Interest (%)', width: 120, type: 'number' },
    { field: 'duration', headerName: 'Duration (days)', width: 120, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Created At',
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
    { field: 'mpesaStatus', headerName: 'Mpesa Status', width: 180, type: 'string' },
    {
      field: 'disbursementDate',
      headerName: 'Disbursement Date',
      width: 200,
      renderCell: (params) => {
        const value = params.row.disbursementDate;
        if (!value) return '—';
        try {
          return format(new Date(value), 'dd MMM yyyy, HH:mm');
        } catch {
          return '—';
        }
      },
    },
    { field: 'mpesaTrasactionId', headerName: 'Mpesa Transaction ID', width: 180, type: 'string' },
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
  ];

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
          <TitleComponent title="Loans" />
        </Typography>

        {/* Organization Filter */}
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            options={[{ id: null, name: 'All Organizations' }, ...organizations]}
            getOptionLabel={(option) => option.name || ''}
            value={selectedOrg}
            onChange={(event, newValue) => {
              setSelectedOrg(newValue);
              if (newValue) {
                fetchLoansForOrg(newValue.id);
              } else {
                fetchAllLoans();
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Organization"
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 400 } }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            disabled={loading || organizations.length === 0}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}>
            {/* Statistics Section */}
            {selectedOrg && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Organization Loan Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.background.paper }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Total Loans
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {stats.totalLoans}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.background.paper }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Loans This Month
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {stats.loansThisMonth}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.background.paper }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Disbursed This Month
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: loanStatusColors.DISBURSED }}>
                          {stats.statusCountsThisMonth.DISBURSED} ({stats.disbursedPercentageThisMonth}%)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.background.paper }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Status Counts This Month
                        </Typography>
                        {Object.keys(stats.statusCountsThisMonth).map((key) => (
                          <Typography key={key} variant="body2" sx={{ color: loanStatusColors[key] || theme.palette.text.primary }}>
                            {key}: {stats.statusCountsThisMonth[key]}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* No Loans Message */}
            {Object.keys(groupedLoans).length === 0 && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {selectedOrg ? `No loans found for ${selectedOrg.name}` : 'No loans available'}
                </Typography>
              </Box>
            )}

            {/* Loans Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id="loan-status-label">Loan Status</InputLabel>
                <Select
                  labelId="loan-status-label"
                  value={status}
                  label="Loan Status"
                  onChange={handleStatusChange}
                  disabled={Object.keys(groupedLoans).length === 0}
                >
                  <MenuItem value="" disabled>
                    Select status
                  </MenuItem>
                  <MenuItem value="ALL">All ({Object.values(groupedLoans).flat().length})</MenuItem>
                  {Object.keys(groupedLoans).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key} ({groupedLoans[key]?.length || 0})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                placeholder="Search by ID, Customer, or Organization"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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

            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <DataGrid
                rows={filteredLoans}
                columns={columns}
                getRowId={(row) => row.id}
                autoHeight={false}
                disableSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': { fontSize: '0.9rem' },
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
                }}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                localeText={{ noRowsLabel: 'No loans found' }}
              />
            </Box>
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