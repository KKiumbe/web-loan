import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useAuthStore } from '../../store/authStore';
import { getTheme } from '../../store/theme';
import TitleComponent from '../../components/title';

export default function OrganizationAdminsScreen() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/org-admins`,
        { withCredentials: true }
      );

      const flattened = (res.data.admins || res.data || []).map((admin) => ({
        ...admin,
        organizationName: admin.organization?.name || 'N/A',
      }));

      console.log('this is the admins', flattened);
      setAdmins(flattened);
    } catch (error) {
      console.error('Error fetching organization admins:', error);
      setSnackbar({ open: true, message: 'Failed to fetch admins' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton onClick={() => navigate(`/org-admins/${params.row.id}`)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone', width: 150 },
    { field: 'organizationName', headerName: 'Organization', width: 200 },
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, minHeight: '100vh', p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">
          <TitleComponent title="Organization Admins" />
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/org-admins/create')}
          sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
        >
          Add Admin
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <DataGrid
            rows={admins}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            disableSelectionOnClick
            sx={{ maxWidth: 1400, mx: 'auto' }}
          />
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}
