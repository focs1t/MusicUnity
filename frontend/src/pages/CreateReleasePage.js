import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput, FormControlLabel, Checkbox, Card, Autocomplete, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { releaseApi } from '../shared/api/release';
import { genreApi } from '../shared/api/genre';
import { authorApi } from '../shared/api/author';
import { fileApi } from '../shared/api/file';

// Стилизованные компоненты
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: 'calc(100vh - theme(spacing.16))',
  flexDirection: 'column',
  flex: 1,
  gap: theme.spacing(4),
  backgroundColor: '#09090b',
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(6),
    padding: theme.spacing(10),
  },
  marginTop: '-20px',
  marginBottom: '-20px',
  [theme.breakpoints.up('lg')]: {
    marginTop: '-60px',
    marginBottom: '-60px',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  gap: theme.spacing(2),
}));

const ContentSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(8),
}));

const FormCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: '#111113',
  color: 'white',
  boxShadow: 'none',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingBottom: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingTop: 0,
}));

const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '40px',
  padding: '0 16px',
  backgroundColor: 'white',
  color: 'black',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  height: '40px',
  padding: '0 16px',
  backgroundColor: 'transparent',
  color: 'white',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'rgba(161, 161, 170, 0.8)',
    fontSize: '0.875rem',
    fontWeight: 500,
    '& .MuiInputLabel-asterisk': {
      color: '#ef4444',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
    '& input[type="date"]': {
      colorScheme: 'light',
      '&::-webkit-calendar-picker-indicator': {
        filter: 'none',
        cursor: 'pointer',
      },
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'rgba(161, 161, 170, 0.8)',
    fontSize: '0.875rem',
    fontWeight: 500,
    '& .MuiInputLabel-asterisk': {
      color: '#ef4444',
    },
  },
}));

const AuthorBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  width: 'auto',
  flexShrink: 0,
  padding: theme.spacing(1, 2),
  color: '#ef4444',
  borderColor: '#ef4444',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateReleasePage = () => {
  const navigate = useNavigate();
  
  // Основные поля формы
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    releaseDate: new Date().toISOString().split('T')[0],
    coverFile: null,
    isArtist: false,
    isProducer: false,
    genreIds: [],
    otherAuthors: []
  });
  
  // Состояния для интерфейса
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  
  // Поля для добавления соавторов
  const [authorInput, setAuthorInput] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [newAuthorIsArtist, setNewAuthorIsArtist] = useState(false);
  const [newAuthorIsProducer, setNewAuthorIsProducer] = useState(false);

  // Загружаем список жанров и авторов при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresResponse, authorsResponse] = await Promise.all([
          genreApi.getAllGenres(),
          authorApi.getAllAuthorsForAutocomplete()
        ]);
        setGenres(genresResponse);
        setAuthors(authorsResponse);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      }
    };
    
    fetchData();
  }, []);

  // Обработчики изменения полей формы
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenreChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      genreIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  // Обработка загрузки обложки
  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения');
        return;
      }
      
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        coverFile: file
      }));

      // Создаем предварительный просмотр
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Добавление соавтора
  const handleAddAuthor = () => {
    if (!authorInput.trim()) {
      setError('Введите имя автора');
      return;
    }
    
    if (!newAuthorIsArtist && !newAuthorIsProducer) {
      setError('Выберите хотя бы одну роль для автора');
      return;
    }

    const newAuthor = {
      authorName: selectedAuthor ? selectedAuthor.authorName : authorInput.trim(),
      artist: newAuthorIsArtist,
      producer: newAuthorIsProducer
    };

    setFormData(prev => ({
      ...prev,
      otherAuthors: [...prev.otherAuthors, newAuthor]
    }));

    // Очищаем поля
    setAuthorInput('');
    setSelectedAuthor(null);
    setNewAuthorIsArtist(false);
    setNewAuthorIsProducer(false);
    setError('');
  };

  // Удаление соавтора
  const handleRemoveAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      otherAuthors: prev.otherAuthors.filter((_, i) => i !== index)
    }));
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    if (!formData.title.trim()) {
      setError('Введите название релиза');
      return;
    }

    if (!formData.type) {
      setError('Выберите тип релиза');
      return;
    }

    if (!formData.isArtist && !formData.isProducer) {
      setError('Выберите хотя бы одну роль для себя');
      return;
    }

    if (formData.genreIds.length === 0) {
      setError('Выберите хотя бы один жанр');
      return;
    }

    setLoading(true);

    try {
      // Загружаем обложку если она выбрана
      let coverUrl = "";
      if (formData.coverFile) {
        console.log('Загружаем обложку:', formData.coverFile.name);
        try {
          const uploadResult = await fileApi.uploadCover(formData.coverFile);
          coverUrl = uploadResult.permanentUrl; // Постоянная ссылка на файл
          console.log('Обложка загружена успешно:', uploadResult);
        } catch (uploadError) {
          console.error('Ошибка при загрузке обложки:', uploadError);
          setError('Ошибка при загрузке обложки: ' + (uploadError.response?.data?.message || uploadError.message));
          setLoading(false);
          return;
        }
      }

      // Преобразуем данные в правильный формат для бэкенда (точно как в Swagger)
      const requestData = {
        title: formData.title.trim(),
        type: formData.type, // Строка, как ожидает enum
        releaseDate: formData.releaseDate, // Строка в формате YYYY-MM-DD
        coverUrl: coverUrl, // Полная ссылка на файл
        releaseLink: "", // Пустая строка вместо null
        artist: Boolean(formData.isArtist),
        producer: Boolean(formData.isProducer),
        genreIds: formData.genreIds.map(id => Number(id)), // Массив чисел (Jackson преобразует в Set)
        otherAuthors: formData.otherAuthors.length > 0 ? formData.otherAuthors.map(author => ({
          authorName: String(author.authorName).trim(),
          artist: Boolean(author.artist),
          producer: Boolean(author.producer)
        })) : [] // Пустой массив вместо null
      };

      console.log('=== ОТПРАВЛЯЕМЫЕ ДАННЫЕ ===');
      console.log('title:', requestData.title, typeof requestData.title);
      console.log('type:', requestData.type, typeof requestData.type);
      console.log('releaseDate:', requestData.releaseDate, typeof requestData.releaseDate);
      console.log('coverUrl:', requestData.coverUrl, 'длина:', requestData.coverUrl.length);
      console.log('releaseLink:', requestData.releaseLink);
      console.log('artist:', requestData.artist, typeof requestData.artist);
      console.log('producer:', requestData.producer, typeof requestData.producer);
      console.log('genreIds:', requestData.genreIds, requestData.genreIds.map(id => typeof id));
      console.log('otherAuthors:', requestData.otherAuthors);
      console.log('Полный объект requestData:', JSON.stringify(requestData, null, 2));
      console.log('==========================');

      const result = await releaseApi.createOwnRelease(requestData);
      setSuccess('Релиз успешно создан!');
      
      // Перенаправляем на страницу созданного релиза через 2 секунды
      setTimeout(() => {
        navigate(`/release/${result.releaseId}`);
      }, 2000);

    } catch (err) {
      console.error('=== ОШИБКА ===');
      console.error('Полная ошибка:', err);
      console.error('Response:', err.response);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      console.error('==============');
      
      if (err.response?.status === 500) {
        setError('Внутренняя ошибка сервера. Проверьте корректность данных.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Произошла ошибка при создании релиза');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <ContentContainer>
        <Typography variant="h3" sx={{ fontWeight: 600, fontSize: '1.5rem', mb: 2, color: 'white' }}>
          Создать релиз
        </Typography>
      </ContentContainer>
      
      <ContentSection>
        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: '#d32f2f', color: 'white' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: '#2e7d32', color: 'white' }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Основная информация
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)', fontSize: '0.875rem' }}>
                Введите основные данные релиза
              </Typography>
            </CardHeader>
            
            <CardContent>
              <StyledTextField
                fullWidth
                label="Название релиза"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                required
              />

              <StyledFormControl fullWidth margin="normal" required>
                <InputLabel>Тип релиза</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
                  }}
                >
                  <MenuItem value="SINGLE">Сингл</MenuItem>
                  <MenuItem value="EP">EP</MenuItem>
                  <MenuItem value="ALBUM">Альбом</MenuItem>
                </Select>
              </StyledFormControl>

              <StyledTextField
                fullWidth
                label="Дата релиза"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                margin="normal"
                required
                InputLabelProps={{ 
                  shrink: true
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Обложка релиза
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ 
                    color: 'white', 
                    borderColor: '#555',
                    '&:hover': { borderColor: '#777' },
                    mb: 2
                  }}
                >
                  Выбрать изображение
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleCoverChange}
                  />
                </Button>
                
                {coverPreview && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img
                      src={coverPreview}
                      alt="Предварительный просмотр"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                    <Typography variant="body2" color="#aaa">
                      Обложка выбрана
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </FormCard>

          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Ваша роль в релизе <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
            </CardHeader>
            
            <CardContent>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isArtist}
                    onChange={(e) => handleInputChange('isArtist', e.target.checked)}
                    sx={{ color: '#aaa', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Исполнитель"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isProducer}
                    onChange={(e) => handleInputChange('isProducer', e.target.checked)}
                    sx={{ color: '#aaa', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Продюсер"
              />
            </CardContent>
          </FormCard>

          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Жанры
              </Typography>
            </CardHeader>
            
            <CardContent>
              
              <StyledFormControl fullWidth margin="normal" required>
                <InputLabel>Выберите жанры</InputLabel>
                <Select
                  multiple
                  value={formData.genreIds}
                  onChange={handleGenreChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const genre = genres.find(g => g.genreId === value);
                        return (
                          <Chip 
                            key={value} 
                            label={genre?.name || value}
                            sx={{ bgcolor: '#444', color: 'white' }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
                  }}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre.genreId} value={genre.genreId}>
                      {genre.name}
                    </MenuItem>
                  ))}
                                  </Select>
                </StyledFormControl>
            </CardContent>
          </FormCard>

          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Авторы <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)', fontSize: '0.875rem' }}>
                Добавьте авторов релиза и укажите их роли
              </Typography>
            </CardHeader>
            
            <CardContent>

              {/* Добавление автора */}
              <Box sx={{ mb: 3, p: 2, border: '1px dashed #555', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Добавить автора
                </Typography>
                
                <Autocomplete
                  fullWidth
                  options={authors}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.authorName}
                  value={selectedAuthor}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'object' && newValue !== null) {
                      setSelectedAuthor(newValue);
                      setAuthorInput(newValue.authorName);
                    } else {
                      setSelectedAuthor(null);
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    setAuthorInput(newInputValue);
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Выберите или введите имя автора"
                      margin="normal"
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-popupIndicator': { color: 'rgba(161, 161, 170, 0.8)' },
                    '& .MuiAutocomplete-clearIndicator': { color: 'rgba(161, 161, 170, 0.8)' }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newAuthorIsArtist}
                        onChange={(e) => setNewAuthorIsArtist(e.target.checked)}
                        sx={{ color: '#aaa' }}
                      />
                    }
                    label="Исполнитель"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newAuthorIsProducer}
                        onChange={(e) => setNewAuthorIsProducer(e.target.checked)}
                        sx={{ color: '#aaa' }}
                      />
                    }
                    label="Продюсер"
                    sx={{ color: 'white' }}
                  />
                </Box>

                <SecondaryButton
                  onClick={handleAddAuthor}
                >
                  Добавить автора
                </SecondaryButton>
              </Box>

              {/* Список добавленных авторов */}
              {formData.otherAuthors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
                    Добавленные авторы:
                  </Typography>
                  {formData.otherAuthors.map((author, index) => (
                    <AuthorBlock key={index}>
                      <Box>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                          {author.authorName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)' }}>
                          {[
                            author.artist && 'Исполнитель',
                            author.producer && 'Продюсер'
                          ].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                      <DeleteButton
                        variant="outlined"
                        size="small"
                        onClick={() => handleRemoveAuthor(index)}
                        startIcon={<DeleteIcon />}
                      >
                        Удалить
                      </DeleteButton>
                    </AuthorBlock>
                  ))}
                </Box>
              )}
            </CardContent>
          </FormCard>

          <FormCard>
            <CardFooter>
              <SecondaryButton
                onClick={() => navigate(-1)}
              >
                Отмена
              </SecondaryButton>
              <StyledButton
                type="submit"
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Создание...' : 'Создать релиз'}
              </StyledButton>
            </CardFooter>
          </FormCard>
        </form>
      </ContentSection>
    </MainContainer>
  );
};

export default CreateReleasePage;