import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Alert,
  LinearProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Description as PdfIcon,
  Image as ImageIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { documentAPI } from '../../services/api';

interface Document {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
}

interface DocumentType {
  value: string;
  label: string;
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
  }, []);

  const fetchDocuments = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (typeFilter) params.type = typeFilter;

      const response = await documentAPI.getDocuments(params);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await documentAPI.getDocumentTypes();
      setDocumentTypes(response.data.types);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('title', title || uploadFile.name);
      formData.append('documentType', documentType);
      formData.append('isPublic', isPublic.toString());
      formData.append('tags', tags);

      await documentAPI.uploadDocument(formData);
      
      setSuccess('Documento subido exitosamente');
      setUploadDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return;

    try {
      setError(null);

      await documentAPI.updateDocument(selectedDocument.id, {
        title,
        documentType,
        isPublic,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      setSuccess('Documento actualizado exitosamente');
      setEditDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Error al actualizar el documento');
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await documentAPI.downloadDocument(document.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Error al descargar el documento');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    try {
      await documentAPI.deleteDocument(documentId);
      setSuccess('Documento eliminado exitosamente');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Error al eliminar el documento');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDocumentType('other');
    setIsPublic(false);
    setTags('');
    setUploadFile(null);
    setSelectedDocument(null);
  };

  const openEditDialog = (document: Document) => {
    setSelectedDocument(document);
    setTitle(document.title);
    setDocumentType(document.documentType);
    setIsPublic(document.isPublic);
    setTags(document.tags.join(', '));
    setEditDialog(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon />;
    if (fileType.includes('image')) return <ImageIcon />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <ExcelIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Documentos</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialog(true)}
        >
          Subir Documento
        </Button>
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

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Tipo de Documento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {documentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={fetchDocuments}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents List */}
      <List>
        {documents.map((document) => (
          <Card key={document.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemIcon>
                {getFileIcon(document.fileType)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{document.title}</Typography>
                    {document.isPublic && (
                      <Chip label="Público" size="small" color="primary" />
                    )}
                    <Chip
                      label={getDocumentTypeLabel(document.documentType)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {document.filename} • {formatFileSize(document.fileSize)} • 
                      Subido por {document.uploadedBy.name} • 
                      {new Date(document.createdAt).toLocaleDateString()}
                    </Typography>
                    {document.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {document.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleDownloadDocument(document)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => openEditDialog(document)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteDocument(document.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Card>
        ))}
      </List>

      {documents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron documentos
          </Typography>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Seleccionar Archivo
              </Button>
            </label>
            
            {uploadFile && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Archivo seleccionado: {uploadFile.name}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                label="Tipo de Documento"
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Etiquetas (separadas por comas)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
              helperText="Ej: plan-negocio, financiero, 2024"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              }
              label="Documento público"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleFileUpload}
            disabled={!uploadFile || uploading}
            variant="contained"
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                label="Tipo de Documento"
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Etiquetas (separadas por comas)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              }
              label="Documento público"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateDocument} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;