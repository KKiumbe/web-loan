import React, { useEffect, useState, Component } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import TitleComponent from '../components/title';
import { getTheme } from '../store/theme';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography color="error" sx={{ p: 2 }}>
          Error rendering page: {this.state.error?.message || 'Unknown error'}
        </Typography>
      );
    }
    return this.props.children;
  }
}

const CreateReadingScreen = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = getTheme();
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  const [readingType, setReadingType] = useState('water'); // Default to water
  const [form, setForm] = useState({
    customerId: '',
    reading: '',
  });
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState({ customerId: '', reading: '' });

  // Redirect to login if no user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/buildings`, {
        params: { page: 1, limit: 100 }, // Fetch all buildings
        withCredentials: true,
      });
      const { buildings } = response.data;
      console.log('Buildings response:', buildings); // Debug log
      setBuildings(buildings || []);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setSnackbarMessage('Failed to fetch buildings');
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBuildings();
    }
  }, [currentUser]);

  // Update units when building is selected
  useEffect(() => {
    if (selectedBuildingId) {
      const building = buildings.find((b) => b.id === selectedBuildingId);
      const allUnits = building?.units || [];
      console.log('Units for selected building:', allUnits); // Debug log
      setUnits(allUnits);
      setSelectedUnitId(''); // Reset unit selection
      setForm((prev) => ({ ...prev, customerId: '' })); // Reset customerId
    } else {
      setUnits([]);
      setSelectedUnitId('');
      setForm((prev) => ({ ...prev, customerId: '' }));
    }
  }, [selectedBuildingId, buildings]);

  // Update customerId when unit is selected
  useEffect(() => {
    if (selectedUnitId) {
      const unit = units.find((u) => u.id === selectedUnitId);
      const customer = unit?.customers[0]; // Assume one customer per unit
      if (customer && (unit?.status === 'OCCUPIED' || unit?.status === 'OCCUPIED_PENDING_PAYMENT')) {
        setForm((prev) => ({ ...prev, customerId: customer.id }));
        setErrors((prev) => ({ ...prev, customerId: '' }));
      } else {
        setForm((prev) => ({ ...prev, customerId: '' }));
        setErrors((prev) => ({
          ...prev,
          customerId:
            unit?.status === 'VACANT'
              ? 'Selected unit is vacant'
              : unit?.status === 'MAINTENANCE'
              ? 'Selected unit is under maintenance'
              : 'Selected unit has no active customer',
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, customerId: '' }));
    }
  }, [selectedUnitId, units]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!form.customerId) {
      newErrors.customerId = 'Please select an occupied unit with an active customer';
    }
    if (!form.reading || isNaN(form.reading) || parseFloat(form.reading) < 0) {
      newErrors.reading = 'Reading must be a non-negative number';
    }
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const endpoint = readingType === 'water' ? '/water-reading' : '/gas-reading';
      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        { ...form, reading: parseFloat(form.reading) },
        { withCredentials: true }
      );
      setSnackbarMessage(response.data.message || 'Reading created successfully');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/record-utility');
      }, 2000);
      setForm({ customerId: '', reading: '' });
      setSelectedBuildingId('');
      setSelectedUnitId('');
      setErrors({ customerId: '', reading: '' });
    } catch (error) {
      console.error(`Error creating ${readingType} reading:`, error);
      setSnackbarMessage(error.response?.data?.message || `Failed to create ${readingType} reading`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 3, ml: 20 }}>
      <Typography variant="h5" gutterBottom sx={{ ml: 5 }}>
        <TitleComponent title="Create Reading" />
      </Typography>

      <ErrorBoundary>
        <Box sx={{ ml: 5, mr: 5, maxWidth: 600 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New {readingType === 'water' ? 'Water' : 'Gas'} Reading
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Reading Type Dropdown */}
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel>Reading Type</InputLabel>
                  <Select
                    value={readingType}
                    onChange={(e) => setReadingType(e.target.value)}
                    label="Reading Type"
                  >
                    <MenuItem value="water">Water</MenuItem>
                    <MenuItem value="gas">Gas</MenuItem>
                  </Select>
                </FormControl>

                {/* Building Dropdown */}
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.customerId}
                >
                  <InputLabel>Building *</InputLabel>
                  <Select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    label="Building *"
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Select a building</em>
                    </MenuItem>
                    {buildings.map((building) => (
                      <MenuItem key={building.id} value={building.id}>
                        {building.buildingName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Unit Dropdown */}
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.customerId}
                >
                  <InputLabel>Unit *</InputLabel>
                  <Select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    label="Unit *"
                    disabled={loading || !selectedBuildingId || units.length === 0}
                  >
                    <MenuItem value="">
                      <em>{units.length === 0 ? 'No units available' : 'Select a unit'}</em>
                    </MenuItem>
                    {units.map((unit) => (
                      <MenuItem
                        key={unit.id}
                        value={unit.id}
                        sx={{
                          color:
                            unit.status === 'VACANT' || unit.status === 'MAINTENANCE'
                              ? 'grey.500'
                              : 'inherit',
                          backgroundColor:
                            unit.status === 'VACANT' || unit.status === 'MAINTENANCE'
                              ? 'grey.100'
                              : 'inherit',
                        }}
                      >
                        {unit.unitNumber}{' '}
                        {unit.status === 'OCCUPIED' || unit.status === 'OCCUPIED_PENDING_PAYMENT'
                          ? unit.customers[0]
                            ? `(${unit.customers[0].firstName} ${unit.customers[0].lastName})`
                            : '(No Customer)'
                          : unit.status === 'VACANT'
                          ? '(Vacant)'
                          : '(Maintenance)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.customerId && (
                    <Typography color="error" variant="caption">
                      {errors.customerId}
                    </Typography>
                  )}
                </FormControl>

                {/* Reading Input */}
                <TextField
                  fullWidth
                  label="Reading"
                  name="reading"
                  type="number"
                  value={form.reading}
                  onChange={handleChange}
                  error={!!errors.reading}
                  helperText={errors.reading}
                  variant="outlined"
                  size="small"
                  margin="normal"
                  sx={{ mb: 2 }}
                  inputProps={{ step: '0.01' }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: theme?.palette?.greenAccent?.main,
                      color: '#fff',
                    }}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Creating...' : 'Create Reading'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/readings')}
                    sx={{ color: theme?.palette?.grey[300], borderColor: theme?.palette?.grey[300] }}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            )}
          </Paper>
        </Box>
      </ErrorBoundary>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CreateReadingScreen;