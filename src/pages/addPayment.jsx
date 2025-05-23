import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Grid,
  Button,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import axios from 'axios';
import TitleComponent from '../components/title';
import { useAuthStore } from '../store/authStore';
import { getTheme } from '../store/theme';

const CreatePayment = () => {
  const BASE = import.meta.env.VITE_BASE_URL;
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  // Search/autocomplete state
  const [orgQuery, setOrgQuery] = useState('');
  const [orgOptions, setOrgOptions] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Form state
  const [form, setForm] = useState({
    totalAmount: '',
    method: '',
    reference: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check authentication and EMPLOYEE role
    if (!currentUser) {
      console.error('No currentUser found. Redirecting to login.');
      setSnackbar({
        open: true,
        message: 'Please log in to continue.',
        severity: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!currentUser.tenantId) {
      console.error('User missing tenantId:', currentUser);
      setSnackbar({
        open: true,
        message: 'Invalid account configuration. Tenant ID missing. Please contact support.',
        severity: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
   
    console.log('Authenticated user:', {
      id: currentUser.id,
      tenantId: currentUser.tenantId,
      role: currentUser.role,
      token: document.cookie.match(/token=([^;]+)/)?.[1] || 'none',
     
    });
  }, [currentUser, navigate]);

  // Debounce fetch organizations by name
  const fetchOrgs = useMemo(
    () =>
      debounce(async (q) => {
        if (!q.trim() || !currentUser?.tenantId) {
          setOrgOptions([]);
          setOrgLoading(false);
          return;
        }
        setOrgLoading(true);
        try {
          const params = { name: q.trim(), page: 1, limit: 10 };
          
          const res = await axios.get(`${BASE}/organizations-search`, {
            params,
            withCredentials: true,
            
          });
          console.log('Organizations response:', JSON.stringify(res.data));
          setOrgOptions(res.data.organizations || []);
        } catch (err) {
          console.error('Error fetching organizations:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers,
            request: {
              url: err.config?.url,
              params: err.config?.params,
              headers: err.config?.headers,
            },
          });
          setSnackbar({
            open: true,
            message:
              err.response?.data?.error ||
              err.response?.data?.message ||
              'Failed to fetch organizations. Check authentication or contact support.',
            severity: 'error',
          });
          setOrgOptions([]);
        } finally {
          setOrgLoading(false);
        }
      }, 300),
    [BASE, currentUser?.tenantId]
  );

  // Effect: when query changes
  useEffect(() => {
    fetchOrgs(orgQuery);
    return () => fetchOrgs.cancel(); // Cleanup debounce
  }, [orgQuery, fetchOrgs]);

  // Handle form field change
  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  // Validate and submit batch payment
  const handleSubmit = async () => {
    if (!selectedOrg) {
      setSnackbar({ open: true, message: 'Please select an organization', severity: 'error' });
      return;
    }
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid total amount', severity: 'error' });
      return;
    }
    if (!form.method) {
      setSnackbar({ open: true, message: 'Please select a payment method', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        organizationId: selectedOrg.id,
        totalAmount: parseFloat(form.totalAmount),
        method: form.method,
        reference: form.reference || undefined,
        remarks: form.remarks || undefined,
      };
      console.log('Submitting payment:', payload);
      await axios.post(`${BASE}/create-payment`, payload, { withCredentials: true });
      setSnackbar({ open: true, message: 'Payment batch created successfully!', severity: 'success' });
      setTimeout(() => navigate('/payments-batches'), 1000);
    } catch (err) {
      console.error('Error creating payment:', err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to create payment batch',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
          <TitleComponent title="Create Organization Payment" />
        </Typography>

        <Paper
          sx={{
            maxWidth: 600,
            mx: 'auto',
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            1. Search & Select Organization
          </Typography>
          <Autocomplete
            freeSolo
            options={orgOptions}
            getOptionLabel={(opt) => opt.name || ''}
            loading={orgLoading}
            inputValue={orgQuery}
            onInputChange={(_, v) => setOrgQuery(v || '')}
            onChange={(_, v) => setSelectedOrg(v)}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {option.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                    Interest Rate: {option.interestRate ? `${(option.interestRate * 100).toFixed(2)}%` : 'N/A'} | Employees: {option.employeeCount || 0}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Organization Name"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {orgLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: theme.palette.grey[300] },
                    '&:hover fieldset': { borderColor: theme.palette.greenAccent.main },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.greenAccent.main },
                  },
                }}
              />
            )}
          />

          {selectedOrg && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                2. Payment Details for "{selectedOrg.name}"
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary, mb: 3 }}>
                Interest Rate: {selectedOrg.interestRate ? `${(selectedOrg.interestRate * 100).toFixed(2)}%` : 'N/A'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Total Amount (KES)"
                    type="number"
                    value={form.totalAmount}
                    onChange={handleChange('totalAmount')}
                    fullWidth
                    required
                    inputProps={{ min: '0', step: '0.01' }}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    error={!form.totalAmount || parseFloat(form.totalAmount) <= 0}
                    helperText={
                      !form.totalAmount || parseFloat(form.totalAmount) <= 0 ? 'Enter a valid amount' : ''
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Payment Method"
                    value={form.method}
                    onChange={handleChange('method')}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    error={!form.method}
                    helperText={!form.method ? 'Select a payment method' : ''}
                  >
                    {['MPESA', 'BANK_TRANSFER', 'CASH', 'CHEQUE'].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reference (optional)"
                    value={form.reference}
                    onChange={handleChange('reference')}
                    fullWidth
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Remarks (optional)"
                    value={form.remarks}
                    onChange={handleChange('remarks')}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: theme.palette.greenAccent.main,
                      '&:hover': { bgcolor: theme.palette.greenAccent.dark },
                    }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Payment'}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette[snackbar.severity].main,
              color: theme.palette[snackbar.severity].contrastText,
              fontSize: '0.9rem',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CreatePayment;