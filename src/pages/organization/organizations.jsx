import { useEffect, useState, Component } from 'react';
import axios from 'axios';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  CircularProgress,
  Typography,
  Box,
  Paper,
  Snackbar,
  Button,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';
import { Link, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuthStore } from '../../store/authStore';
import EditIcon from '@mui/icons-material/Edit'; // ensure this is imported

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography color="error" sx={{ p: 2 }}>
          Error rendering table: {this.state.error?.message || 'Unknown error'}
        </Typography>
      );
    }
    return this.props.children;
  }
}

const OrganizationsScreen = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Removed unused 'page' state
  const [pageSize, setPageSize] = useState(10);
  const [totalOrganizations, setTotalOrganizations] = useState(0);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/organizations`, { withCredentials: true });
      const data = response.data.map((org) => ({
        ...org,
        createdAt: org.createdAt ? new Date(org.createdAt).toISOString() : '',
      }));
      setOrganizations(data);
      setTotalOrganizations(data.length);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      if (err.response?.status === 401) navigate('/login');
      else setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const columns = [
    {
      field: 'actions',
      headerName: 'View',
      width: 100,
      renderCell: (params) => (
        <IconButton component={Link} to={`/org-details/${params.row.id}`}>
          <VisibilityIcon />
        </IconButton>
      ),
     
    },

    {
  field: 'Edit',
  headerName: 'Edit',
  width: 100,
  renderCell: (params) => (
    <IconButton component={Link} to={`/edit-org/${params.row.id}`}>
      <EditIcon />
    </IconButton>
  ),
},

    { field: 'name', headerName: 'Organization Name', width: 200 },
    { field: 'employeeCount', headerName: 'Employees', width: 130, type: 'number' },
    { field: 'loanCount', headerName: 'Loans', width: 130, type: 'number' },
    { field: 'totalLoanAmount', headerName: 'Total Loan (KES)', width: 180, type: 'number' },
    { field: 'approvedLoanAmount', headerName: 'Approved Loan (KES)', width: 200, type: 'number' },
    { field: 'approvalSteps', headerName: 'Approval Steps', width: 150 },
    { field: 'interestRate', headerName: 'Interest Rate', width: 150, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      renderCell: (params) => {
        try {
          const date = new Date(params.value);
          return date.toLocaleString();
        } catch {
          return 'Invalid Date';
        }
      },
    },
  ];

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography component="div" variant="h5">
          <TitleComponent title="Organizations" />
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-organization')}
        >
          Add Organization
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper sx={{ width: '100%', height: 500, overflow: 'auto' }}>
          <ErrorBoundary>
            <DataGrid
              rows={organizations}
              columns={columns}
              getRowId={(row) => row.id}
              pageSize={pageSize}
              rowCount={totalOrganizations}
              paginationMode="client"
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[10, 20, 50]}
              checkboxSelection
              disableSelectionOnClick
              components={{
                Toolbar: () => (
                  <GridToolbarContainer>
                    <GridToolbarExport />
                  </GridToolbarContainer>
                ),
              }}
            />
          </ErrorBoundary>
        </Paper>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default OrganizationsScreen;
