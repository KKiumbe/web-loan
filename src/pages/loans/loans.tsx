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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';
import TitleComponent from '../../components/title';
import debounce from 'lodash/debounce';

const loanStatusColors = {
  PENDING: '#FFA500',
  APPROVED: '#4CAF50',
  REJECTED: '#F44336',
  DISBURSED: '#2196F3',
  REPAID: '#9C27B0',
  UNKNOWN: '#757575',
};

const LoansScreen = () => {
  const [groupedLoans, setGroupedLoans] = useState({});
 const [filteredLoans, setFilteredLoans] = useState([]);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [orgSearch, setOrgSearch] = useState('');
const [orgOptions, setOrgOptions] = useState<{ id: any; name: any; employeeCount: any; }[]>([]);
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

  // Debounced search function
  const debouncedSearchOrgs = useCallback(
    debounce(async (value) => {
      try {
        setOrgLoading(true);
        const res = await axios.get(`${BASE_URL}/organizations-search`, {
          params: { search: value },
          withCredentials: true,
        });
        console.log('searchOrgs response:', res.data);
        const organizations = res.data.organizations || [];
        if (Array.isArray(organizations)) {
          setOrgOptions(
            organizations.map((o) => ({
              id: o.id,
              name: o.name,
              employeeCount: o.employeeCount || 0,
            }))
          );
        } else {
          console.error('Expected organizations array, got:', res.data.organizations);
          setOrgOptions([]);
          setSnackbar({
            open: true,
            message: 'Invalid organization search response',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('searchOrgs error:', error.message);
        setOrgOptions([]);
        setSnackbar({
          open: true,
          message: 'Failed to search organizations',
          severity: 'error',
        });
      } finally {
        setOrgLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (!currentUser) {
      setSnackbar({ open: true, message: 'Please log in to continue.', severity: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    fetchAllLoans();
  }, [currentUser, navigate]);
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
    // Skip invalid loan objects
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
      organizationName,
      interestRate: loan.interestRate !== undefined ? (loan.interestRate * 100).toFixed(2) : 'N/A',
      createdAt: loan.createdAt || null, // Ensure createdAt has a fallback
    });
  });

  console.log('Grouped loans:', grouped);
  setGroupedLoans(grouped);
  const firstStatus = Object.keys(grouped).length > 0 ? Object.keys(grouped)[0] : '';
  setStatus(firstStatus);
  setFilteredLoans(grouped[firstStatus] || []);
};

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setSearchQuery('');
    if (newStatus === 'ALL') {
      setFilteredLoans(Object.values(groupedLoans).flat());
    } else {
      setFilteredLoans(groupedLoans[newStatus] || []);
    }
  };

  const handleOrgSearch = (event) => {
    const value = event.target.value;
    setOrgSearch(value);
    debouncedSearchOrgs(value);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    { field: 'amount', headerName: 'Amount (KES)', width: 150, type: 'number' },
    { field: 'interestRate', headerName: 'Interest (%)', width: 120, type: 'number' },
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

        {/* Organization Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search organization..."
            value={orgSearch}
            onChange={handleOrgSearch}
            variant="outlined"
            size="small"
            sx={{ width: '100%', maxWidth: 400, mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: orgLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
          />
          <Select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const selected = orgOptions.find((o) => o.id === e.target.value);
              setSelectedOrg(selected);
              fetchLoansForOrg(selected.id);
            }}
            displayEmpty
            fullWidth
            size="small"
            disabled={orgLoading || orgOptions.length === 0}
          >
            <MenuItem value="" disabled>
              {orgLoading ? 'Loading...' : orgOptions.length === 0 ? 'No organizations found' : 'Select organization'}
            </MenuItem>
            {orgOptions.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name} {org.employeeCount ? `(${org.employeeCount} employees)` : ''}
              </MenuItem>
            ))}
          </Select>
          {selectedOrg && (
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedOrg(null);
                  setOrgSearch('');
                  setOrgOptions([]);
                  fetchAllLoans();
                }}
              >
                Clear organization filter
              </Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}>
            {/* Statistics Section (Fixed, Non-Scrollable) */}
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

            {/* Loans Section (Scrollable) */}
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