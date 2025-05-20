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
import debounce from "lodash/debounce";
import axios from 'axios';

import TitleComponent from '../components/title';
import { useAuthStore } from '../store/authStore';
import { getTheme } from '../store/theme';


const CreatePayment = () => {

  const BASE = import.meta.env.VITE_BASE_URL;

const currentUser = useAuthStore((state) => state.currentUser);
const navigate = useNavigate();
  const theme = getTheme();


  // search/autocomplete state
  const [orgQuery, setOrgQuery] = useState('');
  const [orgOptions, setOrgOptions] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // form state
  const [form, setForm] = useState({
    totalAmount: '',
    method: '',
    reference: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });


    useEffect(() => {
      if (!currentUser) navigate('/login');
    }, [currentUser, navigate]);
  // debounce fetch organizations by name
  const fetchOrgs = useMemo(() => debounce(async (q) => {
    if (!q.trim()) {
      setOrgOptions([]);
      return;
    }
    setOrgLoading(true);
    try {
      const res = await axios.get(`${BASE}/organizations/search`, {
        params: { name: q.trim(), page: 1, limit: 10 },
        withCredentials: true,
      });
      setOrgOptions(res.data.organizations || []);
    } catch {
      setOrgOptions([]);
    } finally {
      setOrgLoading(false);
    }
  }, 300), [BASE]);

  // effect: when query changes
  useEffect(() => {
    fetchOrgs(orgQuery);
  }, [orgQuery, fetchOrgs]);

  // handle form field change
  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  // submit batch payment
  const handleSubmit = async () => {
    if (!selectedOrg || !form.totalAmount || !form.method) {
      setSnackbar({ open: true, message: 'Please select an organization and fill all required fields', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${BASE}/create-payment`, {
        organizationId: selectedOrg.id,
        totalAmount: parseFloat(form.totalAmount),
        method: form.method,
        reference: form.reference || undefined,
        remarks: form.remarks || undefined,
      }, { withCredentials: true });
      setSnackbar({ open: true, message: 'Payment batch created!', severity: 'success' });
      setTimeout(() => navigate('/payment-batches'), 1000);
    } catch (err) {
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
    <Box sx={{ p: 3 }}>
      <TitleComponent title="Create Organization Payment" />

      <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          1. Search & select organization
        </Typography>
        <Autocomplete
          freeSolo
          options={orgOptions}
          getOptionLabel={opt => opt.name}
          loading={orgLoading}
          inputValue={orgQuery}
          onInputChange={(_, v) => setOrgQuery(v)}
          onChange={(_, v) => setSelectedOrg(v)}
          renderInput={params => (
            <TextField
              {...params}
              label="Organization name"
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
            <Typography variant="h6" gutterBottom>
              2. Payment details for “{selectedOrg.name}”
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
                >
                  {['MPESA','BANK_TRANSFER','CASH','CHEQUE'].map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reference (optional)"
                  value={form.reference}
                  onChange={handleChange('reference')}
                  fullWidth
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
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  fullWidth
                  sx={{
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
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePayment;
