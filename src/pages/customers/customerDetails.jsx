import { useState, useEffect } from 'react';
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { getTheme } from '../../store/theme';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const BASEURL = import.meta.env.VITE_BASE_URL;

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

    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${BASEURL}/employee-details/${id}`, { withCredentials: true });
        const { employee, loanStats, allLoans } = res.data;

        const formattedUser = {
          fullName: `${employee.firstName} ${employee.lastName}`,
          phoneNumber: employee.phoneNumber,
          idNumber: employee.idNumber || '—',
          secondaryPhoneNumber: employee.secondaryPhoneNumber || '—',
          grossSalary: employee.grossSalary ? `KES ${employee.grossSalary}` : '—',
          tenantName: employee.tenant,
          organizationName: employee.organization,
          email: '—',
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          loans: allLoans.map((loan) => ({
            ...loan,
            organizationName: loan.organization || '—',
            createdAt: new Date(loan.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          })),
          loanStats,
        };

        setUser(formattedUser);
      } catch (err) {
        console.error('Error fetching employee details:', err);
        const msg = err.response?.data?.message || 'Failed to load employee details';
        setError(msg);
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, currentUser, navigate]);

  const handleDelete = async () => {
      setDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${BASEURL}/employee-user/${id}`, { withCredentials: true });
      setSnackbar({
        open: true,
        message: 'Employee deleted successfully',
        severity: 'success',
      });
      setTimeout(() => navigate('/employees'), 2000);
       setDeleting(false);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      const msg = err.response?.data?.error || 'Failed to delete employee';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  const loanColumns = [
    { field: 'id', headerName: 'Loan ID', width: 100 },
    {
      field: 'amount',
      headerName: 'Amount (KES)',
      width: 150,
      type: 'number',
     
    },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'organizationName', headerName: 'Organization', width: 200 },
    { field: 'createdAt', headerName: 'Date', width: 160 },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography sx={{ color: theme.palette.error.main, fontSize: '1rem', mb: 3, fontWeight: 500 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            bgcolor: theme.palette.greenAccent.main,
            color: theme.palette.greenAccent.contrastText,
            '&:hover': {
              bgcolor: theme.palette.greenAccent.light,
              color: theme.palette.greenAccent.dark,
            },
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container
      sx={{
       minHeight: '100vh', width: '100vw',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' , p: { xs: 3, sm: 4 }, }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: theme.palette.greenAccent.main, mr: 2 }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            {user.fullName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/customer-edit/${id}`)}
            sx={{
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: theme.palette.greenAccent.main,
              color: theme.palette.greenAccent.main,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: theme.palette.greenAccent.dark,
                color: theme.palette.greenAccent.dark,
              },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
            sx={{
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: theme.palette.error.dark,
                color: theme.palette.error.dark,
              },
            }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {/* Employee Details */}
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          bgcolor: theme.palette.background.paper,
          mb: 4,
          transition: 'all 0.3s ease',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Employee Details
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Phone:</strong> {user.phoneNumber}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Tenant:</strong> {user.tenantName}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Organization:</strong> {user.organizationName}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Role:</strong> {user.role}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Status:</strong> {user.status}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>ID Number:</strong> {user.idNumber}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Secondary Phone:</strong> {user.secondaryPhoneNumber}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Gross Salary:</strong> {user.grossSalary}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Total Loans:</strong> {user.loanStats?.totalLoansTaken || 0}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Loans in Last 12 Months:</strong> {user.loanStats?.loansInLast12Months || 0}
            </Typography>
            <Typography sx={{ fontSize: '1rem', mb: 2, color: theme.palette.text.secondary }}>
              <strong>Average Loan Amount:</strong>{' '}
              KES {user.loanStats?.averageLoanAmount?.toLocaleString('en-US') || 0}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Loan History */}
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          bgcolor: theme.palette.background.paper,
          transition: 'all 0.3s ease',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          Loan History
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
        <DataGrid
          rows={user.loans}
          columns={loanColumns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[5, 10]}
          sx={{
            '& .MuiDataGrid-root': { borderRadius: 2 },
            '& .MuiDataGrid-cell': { fontSize: '1rem', color: theme.palette.text.primary },
            '& .MuiDataGrid-columnHeader': { fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary },
            '& .MuiDataGrid-row:hover': { bgcolor: theme.palette.action.hover },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle id="delete-dialog-title">Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to permanently delete the employee <strong>{user.fullName}</strong>? This action cannot
            be undone and will remove all associated data, including loans and repayments.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
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
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: theme.palette.error.dark },
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Feedback */}
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
    </Container>
  );
}