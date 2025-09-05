import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import debounce from 'lodash/debounce';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';

const EmployeeListScreen = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const BASEURL = import.meta.env.VITE_BASE_URL; // e.g., http://localhost:3000
  const theme = getTheme();

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASEURL}/organizations`, { withCredentials: true });
      const orgs = Array.isArray(res.data) ? res.data : [];
      console.log('Organizations:', orgs);
      setOrganizations(orgs);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setError('Failed to load organizations');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const flattenRow = (emp) => {
    const user = emp.user || {};
    const loans = Array.isArray(user.loans) ? user.loans : [];
    const sortedLoans = [...loans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestLoan = sortedLoans[0] || {};

    const row = {
      id: emp.id,
      userId: user.id || '',
      firstName: user.firstName || emp.firstName || '',
      lastName: user.lastName || emp.lastName || '',
      email: user.email || '—',
      phoneNumber: user.phoneNumber || emp.phoneNumber || '',
      secondaryPhoneNumber: emp.secondaryPhoneNumber || '—',
      idNumber: emp.idNumber || '—',
      grossSalary: emp.grossSalary || 0,
      jobId: emp.jobId || '—',
      organizationName: emp.organization?.name || '—',
      tenantName: emp.tenant?.name || '—',
      loanCount: loans.length,
      latestLoanStatus: latestLoan.status || 'None',
      loanAmount: latestLoan.amount || 0,
      loanInterestRate: latestLoan.interestRate || 0,
      loanDueDate: latestLoan.dueDate || '',
      createdAt: emp.createdAt || '',
    };

    console.log('Flattened Row:', row);
    return row;
  };

  const fetchPage = useCallback(async ({ page, pageSize }) => {
    setLoading(true);
    setError('');
    try {
      const resp = await axios.get(`${BASEURL}/customers/employee-users`, {
        params: { page: page + 1, limit: pageSize },
        withCredentials: true,
      });

      const { data, total } = resp.data.data || { data: [], total: 0 };
      const validRows = Array.isArray(data)
        ? data.filter(emp => emp && emp.phoneNumber).map(flattenRow)
        : [];
      console.log('Valid Rows:', validRows);
      setRows(validRows);
      setRowCount(total || 0);
    } catch (err) {
      console.error('Error fetching employee users:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [BASEURL, navigate]);

  const fetchByOrganization = useCallback(async ({ page, pageSize, organizationId }) => {
    setLoading(true);
    setError('');
    try {
      const resp = await axios.get(`${BASEURL}/employees/by-organization`, {
        params: { organizationId: String(organizationId), page: page + 1, limit: pageSize },
        withCredentials: true,
      });

      const { data, total } = resp.data.data || { data: [], total: 0 };
      const validRows = Array.isArray(data)
        ? data.filter(emp => emp && emp.phoneNumber).map(flattenRow)
        : [];
      console.log('Organization Rows:', validRows);
      setRows(validRows);
      setRowCount(total || 0);
    } catch (err) {
      console.error('Error fetching employees by organization:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [BASEURL, navigate]);

  const handleError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      navigate('/login');
    } else if (err.response?.status === 404) {
      setError(err.response?.data?.message || 'Resource not found.');
    } else {
      setError(err.response?.data?.message || 'Failed to load employees.');
    }
    setSnackbarOpen(true);
    setRows([]);
    setRowCount(0);
  };

  const doSearch = useCallback(
    debounce(async ({ type, query, page, pageSize, organizationId }) => {
      setIsSearching(true);
      try {
        // If no query and organizationId is provided, use /employees/by-organization
        if (!query.trim() && organizationId) {
          return fetchByOrganization({ page, pageSize, organizationId });
        }

        // If no query and no organizationId, fetch all employees
        if (!query.trim() && !organizationId) {
          return fetchPage({ page, pageSize });
        }

        const url = type === 'name' ? `${BASEURL}/employees/search-by-name` : `${BASEURL}/employees/search-by-phone`;
        const params = {
          page: page + 1,
          limit: pageSize,
          ...(type === 'name' && query.trim() ? { name: query.trim() } : {}),
          ...(type === 'phone' && query.trim() ? { phone: query.trim() } : {}),
          ...(organizationId ? { organizationId: String(organizationId) } : {}),
        };
        const resp = await axios.get(url, { params, withCredentials: true });
        const { data, total } = resp.data.data || { data: [], total: 0 };
        const validRows = Array.isArray(data)
          ? data.filter(emp => emp && emp.phoneNumber).map(flattenRow)
          : [];
        console.log('Search Rows:', validRows);
        setRows(validRows);
        setRowCount(total || 0);
      } catch (err) {
        console.error('Error searching employees:', err);
        handleError(err);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [BASEURL, fetchPage, fetchByOrganization]
  );

  useEffect(() => {
    const { page, pageSize } = paginationModel;
    doSearch({
      type: searchType,
      query: searchQuery,
      page,
      pageSize,
      organizationId: selectedOrg?.id,
    });
  }, [paginationModel, searchType, searchQuery, selectedOrg, doSearch]);

  const columns = [
    {
      field: 'view',
      headerName: 'View',
      width: 70,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/user-details/${params.row.userId}`}
          size="small"
          disabled={!params.row.userId}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 70,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/customer-edit/${params.row.userId}`}
          size="small"
          disabled={!params.row.userId}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
    { field: 'userId', headerName: 'User ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone', width: 130, renderCell: (params) => params.value || '–' },
    { field: 'secondaryPhoneNumber', headerName: 'Alt Phone', width: 130, renderCell: (params) => params.value || '–' },
    { field: 'idNumber', headerName: 'ID Number', width: 130, renderCell: (params) => params.value || '–' },
    { field: 'grossSalary', headerName: 'Gross Salary', type: 'number', width: 140 },
    { field: 'jobId', headerName: 'Job ID', width: 120, renderCell: (params) => params.value || '–' },
    { field: 'organizationName', headerName: 'Organization', width: 180, renderCell: (params) => params.value || '–' },
    { field: 'tenantName', headerName: 'Lender', width: 180, renderCell: (params) => params.value || '–' },
    { field: 'loanCount', headerName: 'Loan Count', type: 'number', width: 120 },
    { field: 'latestLoanStatus', headerName: 'Loan Status', width: 130, renderCell: (params) => params.value || '–' },
    { field: 'loanAmount', headerName: 'Loan Amount', type: 'number', width: 140 },
    {
      field: 'loanInterestRate',
      headerName: 'Interest Rate',
      width: 130,
      renderCell: (params) =>
        params.value ? `${(params.value * 100).toFixed(1)}%` : '–',
    },
    {
      field: 'loanDueDate',
      headerName: 'Due Date',
      width: 140,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '–',
    },
    {
      field: 'createdAt',
      headerName: 'Joined On',
      width: 180,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '–',
    },
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, minHeight: '100vh', p: 3, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        <TitleComponent title="Employees" />
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={searchType}
          exclusive
          size="small"
          onChange={(_, v) => {
            if (v) {
              setSearchType(v);
              setSearchQuery('');
              setPaginationModel((m) => ({ ...m, page: 0 }));
            }
          }}
        >
          <ToggleButton value="name">Name</ToggleButton>
          <ToggleButton value="phone">Phone</ToggleButton>
        </ToggleButtonGroup>


          <TextField
          size="small"
          placeholder={`Search by ${searchType === 'name' ? 'Name' : 'Phone Number'}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <>
                {(isSearching || loading) && <CircularProgress size={16} />}
                {!!searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ),
          }}
          sx={{ width: 240 }}
        />
        <Autocomplete

        
          options={[{ id: null, name: 'All Organizations' }, ...organizations]}
          getOptionLabel={(option) => option.name || ''}
          value={selectedOrg}
          onChange={(event, newValue) => {
            setSelectedOrg(newValue);
            setPaginationModel((m) => ({ ...m, page: 0 }));
          }}

          
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter by Organization"
              variant="outlined"
              size="small"
              sx={{ width: 240 }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          sx={{ width: 240 }}
        />
      
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setPaginationModel((m) => ({ ...m, page: 0 }));
            doSearch({
              type: searchType,
              query: searchQuery,
              page: 0,
              pageSize: paginationModel.pageSize,
              organizationId: selectedOrg?.id,
            });
          }}
          disabled={isSearching || loading}
        >
          Search
        </Button>
      </Box>
      <Paper sx={{ height: 520, width: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ minWidth: 1200 }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer>
                <GridToolbarExport />
              </GridToolbarContainer>
            ),
          }}
        />
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeListScreen;