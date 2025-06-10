import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput, FormControlLabel, Checkbox, Card, CardContent, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { releaseApi } from '../shared/api/release';
import { genreApi } from '../shared/api/genre';
import { authorApi } from '../shared/api/author';
import { fileApi } from '../shared/api/file';

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создать релиз
        </Typography>
        
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
          <Card sx={{ bgcolor: '#222', color: 'white', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              
              <TextField
                fullWidth
                label="Название релиза"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                required
                InputLabelProps={{ style: { color: '#aaa' } }}
                InputProps={{ style: { color: 'white' } }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#777' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: '#aaa' }}>Тип релиза</InputLabel>
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
              </FormControl>

              <TextField
                fullWidth
                label="Дата релиза"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                margin="normal"
                required
                InputLabelProps={{ 
                  style: { color: '#aaa' },
                  shrink: true
                }}
                InputProps={{ style: { color: 'white' } }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#777' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
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
          </Card>

          <Card sx={{ bgcolor: '#222', color: 'white', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ваша роль в релизе
              </Typography>
              
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
          </Card>

          <Card sx={{ bgcolor: '#222', color: 'white', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Жанры
              </Typography>
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: '#aaa' }}>Выберите жанры</InputLabel>
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
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#222', color: 'white', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Соавторы (необязательно)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                  freeSolo
                  options={authors}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.authorName}
                  inputValue={authorInput}
                  onInputChange={(event, newInputValue) => {
                    setAuthorInput(newInputValue);
                  }}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'object' && newValue !== null) {
                      setSelectedAuthor(newValue);
                      setAuthorInput(newValue.authorName);
                    } else {
                      setSelectedAuthor(null);
                    }
                  }}
                  sx={{ 
                    flex: 1,
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#555' },
                      '&:hover fieldset': { borderColor: '#777' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Имя автора"
                      InputLabelProps={{ style: { color: '#aaa' } }}
                      InputProps={{ 
                        ...params.InputProps,
                        style: { color: 'white' }
                      }}
                    />
                  )}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAuthorIsArtist}
                      onChange={(e) => setNewAuthorIsArtist(e.target.checked)}
                      sx={{ color: '#aaa', '&.Mui-checked': { color: '#1976d2' } }}
                    />
                  }
                  label="Исполнитель"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAuthorIsProducer}
                      onChange={(e) => setNewAuthorIsProducer(e.target.checked)}
                      sx={{ color: '#aaa', '&.Mui-checked': { color: '#1976d2' } }}
                    />
                  }
                  label="Продюсер"
                />
                
                <Button
                  variant="outlined"
                  onClick={handleAddAuthor}
                  sx={{ 
                    color: 'white', 
                    borderColor: '#555',
                    '&:hover': { borderColor: '#777' }
                  }}
                >
                  Добавить
                </Button>
              </Box>

              {formData.otherAuthors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Добавленные соавторы:
                  </Typography>
                  {formData.otherAuthors.map((author, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ flex: 1 }}>
                        {author.authorName} ({author.artist && 'Исполнитель'}{author.artist && author.producer && ', '}{author.producer && 'Продюсер'})
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveAuthor(index)}
                      >
                        Удалить
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ 
                color: 'white', 
                borderColor: '#555',
                '&:hover': { borderColor: '#777' }
              }}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              {loading ? 'Создание...' : 'Создать релиз'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default CreateReleasePage;