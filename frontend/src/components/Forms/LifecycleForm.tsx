import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Alert,
  Grid,
  LinearProgress,
} from '@mui/material';
import { entrepreneurAPI } from '../../services/api';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'boolean' | 'number';
}

interface StageQuestions {
  [key: string]: Question[];
}

const stages = [
  { key: 'ideacion', label: 'Ideación' },
  { key: 'preincubacion', label: 'Pre-incubación' },
  { key: 'incubacion', label: 'Incubación' },
  { key: 'aceleracion', label: 'Aceleración' },
  { key: 'consolidacion', label: 'Consolidación' },
];

const LifecycleForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState<StageQuestions>({});
  const [responses, setResponses] = useState<{ [stage: string]: { [questionId: string]: any } }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await entrepreneurAPI.getLifecycleQuestions();
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleResponseChange = (questionId: string, value: any) => {
    const currentStage = stages[activeStep].key;
    setResponses(prev => ({
      ...prev,
      [currentStage]: {
        ...prev[currentStage],
        [questionId]: value
      }
    }));
  };

  const handleSaveStage = async () => {
    const currentStage = stages[activeStep].key;
    const stageResponses = responses[currentStage] || {};

    try {
      setSaving(true);
      setError(null);
      
      await entrepreneurAPI.updateLifecycleForm({
        stage: currentStage,
        responses: stageResponses
      });

      setSuccess(`Etapa "${stages[activeStep].label}" guardada exitosamente`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error saving stage:', error);
      setError('Error al guardar las respuestas');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStageQuestions = () => {
    const currentStage = stages[activeStep].key;
    return questions[currentStage] || [];
  };

  const getCurrentStageResponses = () => {
    const currentStage = stages[activeStep].key;
    return responses[currentStage] || {};
  };

  const renderQuestion = (question: Question) => {
    const currentResponses = getCurrentStageResponses();
    const value = currentResponses[question.id] || '';

    switch (question.type) {
      case 'boolean':
        return (
          <FormControl component="fieldset" key={question.id} sx={{ width: '100%', mb: 3 }}>
            <FormLabel component="legend">{question.question}</FormLabel>
            <RadioGroup
              value={value.toString()}
              onChange={(e) => handleResponseChange(question.id, e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        );

      case 'number':
        return (
          <TextField
            key={question.id}
            fullWidth
            label={question.question}
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value) || 0)}
            margin="normal"
            sx={{ mb: 3 }}
          />
        );

      case 'text':
      default:
        return (
          <TextField
            key={question.id}
            fullWidth
            label={question.question}
            multiline
            rows={3}
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            margin="normal"
            sx={{ mb: 3 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando formulario...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Formulario de Ciclo de Vida del Emprendimiento
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {stages.map((stage, index) => (
          <Step key={stage.key}>
            <StepLabel>{stage.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {stages[activeStep].label}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            {getCurrentStageQuestions().map(question => renderQuestion(question))}
          </Box>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Anterior
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={handleSaveStage}
                disabled={saving}
                variant="contained"
                color="primary"
              >
                {saving ? 'Guardando...' : 'Guardar Etapa'}
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={handleNext}
                disabled={activeStep === stages.length - 1}
                variant="outlined"
              >
                Siguiente
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Etapa {activeStep + 1} de {stages.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default LifecycleForm;