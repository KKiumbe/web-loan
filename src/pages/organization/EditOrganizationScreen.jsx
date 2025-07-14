import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';

export default function EditOrg() {
  const [formData, setFormData] = useState({
    name: '',
    approvalSteps: '',
    loanLimitMultiplier: '',
    interestRate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) return;

    axios.get(`${BASE_URL}/organizations/${id}`, { withCredentials: true })
      .then((res) => {
        const org = res.data;
        setFormData({
          name: org.name || '',
          approvalSteps: org.approvalSteps?.toString() || '',
          loanLimitMultiplier: org.loanLimitMultiplier?.toString() || '',
          interestRate: org.interestRate?.toString() || '',
        });
      })
      .catch((err) => {
        console.error('Failed to load organization:', err);
        setSnackbar({ open: true, message: 'Failed to load organization data' });
      });
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.approvalSteps !== '') {
      const n = Number(formData.approvalSteps);
      if (!Number.isInteger(n) || n < 0) newErrors.approvalSteps = 'Must be a non-negative integer';
    }
    if (formData.loanLimitMultiplier !== '') {
      const n = Number(formData.loanLimitMultiplier);
      if (isNaN(n) || n <= 0) newErrors.loanLimitMultiplier = 'Must be a positive number';
    }
    if (formData.interestRate !== '') {
      const n = Number(formData.interestRate);
      if (isNaN(n) || n < 0) newErrors.interestRate = 'Must be a non-negative number';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      approvalSteps: Number(formData.approvalSteps),
      loanLimitMultiplier: Number(formData.loanLimitMultiplier),
      interestRate: Number(formData.interestRate),
    };

    setLoading(true);
    try {
      const res = await axios.put(`${BASE_URL}/organizations/${id}`, payload, {
        withCredentials: true,
      });
      setSnackbar({ open: true, message: res.data.message || 'Organization updated successfully' });
      setTimeout(() => navigate('/organizations'), 2000);
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.error || 'Update failed';
      setSnackbar({ open: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Edit Organization" />
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Approval Steps"
                name="approvalSteps"
                type="number"
                value={formData.approvalSteps}
                onChange={handleChange}
                error={!!errors.approvalSteps}
                helperText={errors.approvalSteps || 'Enter 0 for auto-approval'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Loan Limit Multiplier"
                name="loanLimitMultiplier"
                type="number"
                value={formData.loanLimitMultiplier}
                onChange={handleChange}
                error={!!errors.loanLimitMultiplier}
                helperText={errors.loanLimitMultiplier}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                error={!!errors.interestRate}
                helperText={errors.interestRate}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/organizations')} fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ backgroundColor: theme.palette.greenAccent.main, color: '#fff' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
