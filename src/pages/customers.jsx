import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import debounce from 'lodash/debounce';
import TitleComponent from '../components/title';
import { getTheme } from '../store/theme';

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Something went wrong.</Typography>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const CustomerScreen = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const BASEURL = import.meta.env.VITE_BASE_URL;
  const theme = getTheme();

  // grid state
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);

  // search state
  const [searchType, setSearchType] = useState('name'); // 'name' or 'phone'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // error/snackbar
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  /**
   * Normalize a Prisma `employee` record into the shape our grid wants.
   */
  const flattenRow = (emp) => {
    const user = emp.user ?? {};
    const loans = Array.isArray(user.loans) ? user.loans : [];
    const firstLoan = loans[0] || {};

    return {
      id: emp.id, // required by DataGrid
      userId: user.id || 'N/A',
      firstName: user.firstName || emp.firstName || '',
      lastName: user.lastName || emp.lastName || '',
      email: user.email || 'N/A',
      phoneNumber: user.phoneNumber || emp.phoneNumber || '',
      idNumber: emp.idNumber || 'N/A',
      grossSalary: emp.grossSalary || 0,
      jobId: emp.jobId || 'N/A',
      secondaryPhoneNumber: emp.secondaryPhoneNumber || 'N/A',
      organizationName: emp.organization?.name || 'N/A',
      tenantName: emp.tenant?.name || 'N/A',
      loanCount: loans.length,
      latestLoanStatus: firstLoan.status || 'None',
      loanAmount: firstLoan.amount || 0,
      loanInterestRate: firstLoan.interestRate || 0,
      loanDueDate: firstLoan.dueDate || '',
      createdAt: emp.createdAt || '',
    };
  };

  // fetch one page of employees (no search)
  const fetchPage = useCallback(
    async ({ page, pageSize }) => {
      setLoading(true);
      setError('');
      try {
        const resp = await axios.get(`${BASEURL}/customers/employee-users`, {
          params: { page: page + 1, limit: pageSize },
          withCredentials: true,
        });
        const { employees, total } = resp.data;

        console.log(`objects: ${JSON.stringify(employees, null, 2)}`);
        const validRows = Array.isArray(employees)
          ? employees
              .filter((emp) => emp && typeof emp === 'object' && emp.phoneNumber && emp.createdAt)
              .map(flattenRow)
          : [];
        console.log('Flattened Rows:', JSON.stringify(validRows, null, 2));
        setRows(validRows);
        setRowCount(total || 0);
      } catch (err) {
        console.error(err);
        setError('Failed to load employees.');
        setSnackbarOpen(true);
        setRows([]);
        setRowCount(0);
      } finally {
        setLoading(false);
      }
    },
    [BASEURL]
  );

  // debounced search (by name or phone)
  const doSearch = useCallback(
    debounce(
      async ({ type, query, page, pageSize }) => {
        if (!query.trim()) {
          return fetchPage({ page, pageSize });
        }
        setIsSearching(true);
        setError('');
        try {
          const url = `${BASEURL}/employees/search-by-${type}`;
          const params = {
            tenantId: currentUser.tenantId,
            page: page + 1,
            limit: pageSize,
          };
          if (type === 'phone') params.phone = query.trim();
          else params.name = query.trim();

          const resp = await axios.get(url, { params, withCredentials: true });
          const { employees, total } = resp.data;
          const validRows = Array.isArray(employees)
            ? employees
                .filter((emp) => emp && typeof emp === 'object' && emp.phoneNumber && emp.createdAt)
                .map(flattenRow)
            : [];
          console.log('Flattened Search Rows:', JSON.stringify(validRows, null, 2));
          setRows(validRows);
          setRowCount(total || 0);
        } catch (err) {
          console.error(err);
          setError('Search failed.');
          setSnackbarOpen(true);
          setRows([]);
          setRowCount(0);
        } finally {
          setIsSearching(false);
        }
      },
      500
    ),
    [BASEURL, currentUser, fetchPage]
  );

  // on mount & when page, pageSize, searchQuery or searchType changes
  useEffect(() => {
    const { page, pageSize } = paginationModel;
    if (!searchQuery.trim()) {
      fetchPage({ page, pageSize });
    } else {
      doSearch({ type: searchType, query: searchQuery, page, pageSize });
    }
  }, [paginationModel, searchQuery, searchType, fetchPage, doSearch]);

  const columns = [
    {
      field: 'view',
      headerName: 'View',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/user-details/${params.id === 'N/A' ? params.row.phoneNumber : params.row.userId}`}
          size="small"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/customer-edit/${params.row.userId === 'N/A' ? params.row.phoneNumber : params.row.userId}`}
          size="small"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'userId',
      headerName: 'User ID',
      width: 90,
      renderCell: (params) => params.row.userId || 'N/A',
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 130,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 130,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
     // renderCell: (params) => params.row.email || 'N/A',
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => {
        const phone = params.row.phoneNumber || 'N/A';
        return (
          <a href={`tel:${phone}`} style={{ textDecoration: 'none' }}>
            {phone}
          </a>
        );
      },
    },
    {
      field: 'idNumber',
      headerName: 'ID Number',
      width: 140,
    },
    {
      field: 'grossSalary',
      headerName: 'Salary',
      type: 'number',
      width: 120,
     // renderCell: (params) => params.row.grossSalary ? params.row.grossSalary.toLocaleString() : 'N/A',
    },
    {
      field: 'jobId',
      headerName: 'Job ID',
      width: 120,
      //renderCell: (params) => params.row.jobId || 'N/A',
    },
    {
      field: 'secondaryPhoneNumber',
      headerName: 'Alt Phone',
      width: 140,
      //renderCell: (params) => params.row.secondaryPhoneNumber || 'N/A',
    },
    {
      field: 'organizationName',
      headerName: 'Organization',
      width: 180,
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      width: 180,
    },
    {
      field: 'loanCount',
      headerName: 'Loan Count',
      type: 'number',
      width: 100,
    },
    {
      field: 'latestLoanStatus',
      headerName: 'Latest Status',
      width: 140,
    },
    {
      field: 'loanAmount',
      headerName: 'Loan Amount',
      type: 'number',
      width: 140,
      //renderCell: (params) =>
       // params.row.loanAmount ? params.row.loanAmount.toLocaleString() : 'None',
    },
    {
      field: 'loanInterestRate',
      headerName: 'Interest %',
      width: 120,
     // renderCell: (params) =>
      //  params.row.loanInterestRate
       //   ? (params.row.loanInterestRate * 100).toFixed(1) + '%'
        //  : 'None',
    },
    {
      field: 'loanDueDate',
      headerName: 'Due Date',
      width: 140,
      //renderCell: (params) =>
        //params.row.loanDueDate
        //  ? new Date(params.row.loanDueDate).toLocaleDateString()
        //  : '–',
    },
    {
      field: 'createdAt',
      headerName: 'Joined On',
      width: 180,
      //renderCell: (params) =>
     //  params.row.createdAt
        //  ? new Date(params.row.createdAt).toLocaleString(undefined, {
           //   dateStyle: 'medium',
         //     timeStyle: 'short',
        //    })
        //  : '–',
    },
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, minHeight: '100vh', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, ml: 1 }}>
        <TitleComponent title="Employees" />
      </Typography>

      {/* Search controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', ml: 1 }}>
        <ToggleButtonGroup
          value={searchType}
          exclusive
          size="small"
          onChange={(_, v) => v && setSearchType(v)}
        >
          <ToggleButton value="name">Name</ToggleButton>
          <ToggleButton value="phone">Phone</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder={searchType === 'name' ? 'Search by name…' : 'Search by phone…'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setPaginationModel((m) => ({ ...m, page: 0 }));
              doSearch({ type: searchType, query: searchQuery, page: 0, pageSize: paginationModel.pageSize });
            }
          }}
          InputProps={{
            endAdornment: (
              <>
                {(isSearching || loading) && <CircularProgress size={16} />}
                {!!searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setPaginationModel((m) => ({ ...m, page: 0 }));
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ),
          }}
          sx={{ width: 240 }}
        />

        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setPaginationModel((m) => ({ ...m, page: 0 }));
            doSearch({ type: searchType, query: searchQuery, page: 0, pageSize: paginationModel.pageSize });
          }}
          disabled={isSearching}
        >
          Search
        </Button>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ height: 520, width: '100%', ml: 1 }}>
        <ErrorBoundary>
          {rows.length === 0 && !loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No data available.</Typography>
            </Box>
          ) : (
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
              components={{
                Toolbar: () => (
                  <GridToolbarContainer>
                    <GridToolbarExport />
                  </GridToolbarContainer>
                ),
              }}
            />
          )}
        </ErrorBoundary>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerScreen;