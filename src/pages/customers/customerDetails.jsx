import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Button,
  Snackbar,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { getTheme } from '../../store/theme';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const BASEURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    axios
      .get(`${BASEURL}/employee-details/${id}`, { withCredentials: true })
      .then((res) => {
        const data = res.data;
        const flatUser = {
          id: data.id,
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email || '—',
          phoneNumber: data.phoneNumber,
          tenantName: data.tenant?.name || '—',
          organizationName: data.organization?.name || '—',
          role: Array.isArray(data.role) ? data.role.join(', ') : data.role,
          status: data.status,
          idNumber: data.employee?.idNumber || '—',
          secondaryPhoneNumber: data.employee?.secondaryPhoneNumber || '—',
          grossSalary: data.employee?.grossSalary ? `KES ${data.employee.grossSalary}` : '—',
          loans: (data.loans || []).map((loan) => ({
            ...loan,
            organizationName: loan.organization?.name || '—',
          })),
        };
        setUser(flatUser);
      })
      .catch((err) => {
        console.error('Error fetching user details:', err);
        const msg = err.response?.data?.error || 'Failed to load user details';
        setError(msg);
        setSnackbar({ open: true, message: msg });
      })
      .finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  const loanColumns = [
    { field: 'id', headerName: 'Loan ID', width: 100 },
    { field: 'amount', headerName: 'Amount (KES)', width: 150, type: 'number' },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'organizationName', headerName: 'Organization', width: 200 },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: theme.palette.greenAccent.main }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ ml: 1 }}>
            {user.fullName}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/customer-edit/${id}`)}
          sx={{ color: theme.palette.greenAccent.main, borderColor: theme.palette.greenAccent.main }}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Phone:</strong> {user.phoneNumber}</Typography>
            <Typography><strong>Tenant:</strong> {user.tenantName}</Typography>
            <Typography><strong>Organization:</strong> {user.organizationName}</Typography>
            <Typography><strong>Role:</strong> {user.role}</Typography>
            <Typography><strong>Status:</strong> {user.status}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>ID Number:</strong> {user.idNumber}</Typography>
            <Typography><strong>Secondary Phone:</strong> {user.secondaryPhoneNumber}</Typography>
            <Typography><strong>Gross Salary:</strong> {user.grossSalary}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Loan History
      </Typography>
      <DataGrid
        rows={user?.loans}
        columns={loanColumns}
        getRowId={(row) => row?.id}
        autoHeight
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
