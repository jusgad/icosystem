import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { meetingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  trainingHours?: number;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  entrepreneur?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface Entrepreneur {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const MeetingCalendar: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [notes, setNotes] = useState('');
  const [trainingHours, setTrainingHours] = useState('');

  useEffect(() => {
    fetchMeetings();
    if (user?.role === 'ally' || user?.role === 'super_user') {
      fetchEntrepreneurs();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      const response = await meetingAPI.getMeetings();
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Error al cargar las reuniones');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntrepreneurs = async () => {
    try {
      const response = await meetingAPI.getAvailableEntrepreneurs();
      setEntrepreneurs(response.data.entrepreneurs);
    } catch (error) {
      console.error('Error fetching entrepreneurs:', error);
    }
  };

  const handleCreateMeeting = async () => {
    if (!title || !startTime || !endTime) {
      setError('Título, fecha de inicio y fecha de fin son requeridos');
      return;
    }

    try {
      setError(null);

      const meetingData = {
        title,
        description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        entrepreneurId: selectedEntrepreneur || null,
        createGoogleMeet: true
      };

      await meetingAPI.createMeeting(meetingData);

      setSuccess('Reunión creada exitosamente');
      setCreateDialog(false);
      resetForm();
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Error al crear la reunión');
    }
  };

  const handleUpdateMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      setError(null);

      const updateData: any = {
        title,
        description,
        status,
        notes
      };

      if (startTime) updateData.startTime = startTime.toISOString();
      if (endTime) updateData.endTime = endTime.toISOString();
      if (trainingHours) updateData.trainingHours = parseFloat(trainingHours);

      await meetingAPI.updateMeeting(selectedMeeting.id, updateData);

      setSuccess('Reunión actualizada exitosamente');
      setEditDialog(false);
      resetForm();
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Error al actualizar la reunión');
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reunión?')) {
      return;
    }

    try {
      await meetingAPI.deleteMeeting(meetingId);
      setSuccess('Reunión eliminada exitosamente');
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Error al eliminar la reunión');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime(null);
    setEndTime(null);
    setSelectedEntrepreneur('');
    setStatus('scheduled');
    setNotes('');
    setTrainingHours('');
    setSelectedMeeting(null);
  };

  const openEditDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setTitle(meeting.title);
    setDescription(meeting.description);
    setStartTime(new Date(meeting.startTime));
    setEndTime(new Date(meeting.endTime));
    setStatus(meeting.status);
    setNotes(meeting.notes || '');
    setTrainingHours(meeting.trainingHours?.toString() || '');
    setEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Programada';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Typography>Cargando reuniones...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Calendario de Reuniones</Typography>
          {(user?.role === 'ally' || user?.role === 'super_user') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              Nueva Reunión
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Upcoming Meetings */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Próximas Reuniones
                </Typography>
                <List>
                  {meetings
                    .filter(meeting => new Date(meeting.startTime) >= new Date())
                    .slice(0, 10)
                    .map((meeting) => (
                    <Card key={meeting.id} sx={{ mb: 2 }}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">{meeting.title}</Typography>
                              <Chip
                                label={getStatusLabel(meeting.status)}
                                size="small"
                                color={getStatusColor(meeting.status)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                              </Typography>
                              {meeting.entrepreneur && (
                                <Typography variant="body2" color="text.secondary">
                                  Con: {meeting.entrepreneur.user.name}
                                </Typography>
                              )}
                              {meeting.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {meeting.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {meeting.googleMeetLink && (
                            <IconButton
                              onClick={() => window.open(meeting.googleMeetLink, '_blank')}
                              color="primary"
                            >
                              <VideoCallIcon />
                            </IconButton>
                          )}
                          <IconButton onClick={() => openEditDialog(meeting)}>
                            <EditIcon />
                          </IconButton>
                          {(user?.role === 'super_user' || meeting.organizer.id === user?.id) && (
                            <IconButton onClick={() => handleDeleteMeeting(meeting.id)}>
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItem>
                    </Card>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Meetings */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reuniones Recientes
                </Typography>
                <List>
                  {meetings
                    .filter(meeting => meeting.status === 'completed')
                    .slice(0, 5)
                    .map((meeting) => (
                    <ListItem key={meeting.id}>
                      <ListItemText
                        primary={meeting.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDateTime(meeting.startTime)}
                            </Typography>
                            {meeting.trainingHours && (
                              <Typography variant="body2" color="text.secondary">
                                Horas: {meeting.trainingHours}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Meeting Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Nueva Reunión</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Fecha y Hora de Inicio"
                    value={startTime}
                    onChange={setStartTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Fecha y Hora de Fin"
                    value={endTime}
                    onChange={setEndTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                {entrepreneurs.length > 0 && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Emprendedor</InputLabel>
                      <Select
                        value={selectedEntrepreneur}
                        onChange={(e) => setSelectedEntrepreneur(e.target.value)}
                        label="Emprendedor"
                      >
                        <MenuItem value="">Ninguno</MenuItem>
                        {entrepreneurs.map((entrepreneur) => (
                          <MenuItem key={entrepreneur.id} value={entrepreneur.id}>
                            {entrepreneur.user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateMeeting} variant="contained">
              Crear Reunión
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Meeting Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Editar Reunión</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Fecha y Hora de Inicio"
                    value={startTime}
                    onChange={setStartTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Fecha y Hora de Fin"
                    value={endTime}
                    onChange={setEndTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      label="Estado"
                    >
                      <MenuItem value="scheduled">Programada</MenuItem>
                      <MenuItem value="completed">Completada</MenuItem>
                      <MenuItem value="cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {status === 'completed' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horas de Capacitación"
                      type="number"
                      value={trainingHours}
                      onChange={(e) => setTrainingHours(e.target.value)}
                      inputProps={{ step: 0.5, min: 0 }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notas"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateMeeting} variant="contained">
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default MeetingCalendar;