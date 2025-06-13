import React, { useState } from 'react';
import { authorApi } from '../shared/api/author';
import { fileApi } from '../shared/api/file';
import Notification from './Notification';
import './EditAuthorAvatarModal.css';

const EditAuthorAvatarModal = ({ isOpen, onClose, author, onAuthorUpdate }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(author?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  if (!isOpen || !author) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Валидация типа файла
      if (!file.type.startsWith('image/')) {
        setNotification({
          message: 'Выберите файл изображения',
          type: 'error'
        });
        return;
      }
      
      // Валидация размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          message: 'Размер файла не должен превышать 5MB',
          type: 'error'
        });
        return;
      }

      setAvatarFile(file);
      
      // Создаем превью изображения
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Очищаем предыдущие ошибки
      setNotification(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = null;
      
      if (avatarFile) {
        console.log('Загружаем файл аватарки:', avatarFile.name);
        
        try {
          // Загружаем файл на сервер
          const uploadResult = await fileApi.uploadAvatar(avatarFile);
          avatarUrl = uploadResult.permanentUrl; // Используем постоянную ссылку
          console.log('Файл успешно загружен:', uploadResult);
        } catch (uploadError) {
          console.error('Ошибка при загрузке файла:', uploadError);
          setNotification({
            message: uploadError.response?.data?.message || 'Ошибка при загрузке файла',
            type: 'error'
          });
          setLoading(false);
          return;
        }
      }

      // Обновляем аватарку автора
      const updatedAuthor = await authorApi.updateAuthor(author.authorId, {
        avatarUrl: avatarUrl
      });
      
      setNotification({
        message: 'Аватарка автора успешно обновлена',
        type: 'success'
      });

      // Уведомляем родительский компонент об обновлении
      if (onAuthorUpdate) {
        onAuthorUpdate(updatedAuthor);
      }

      // Закрываем модальное окно через небольшую задержку
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Ошибка при обновлении аватарки:', error);
      setNotification({
        message: error.response?.data?.message || 'Ошибка при обновлении аватарки',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAvatarFile(null);
    setAvatarPreview(author?.avatarUrl || '');
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      const updatedAuthor = await authorApi.updateAuthor(author.authorId, {
        avatarUrl: null
      });
      
      setNotification({
        message: 'Аватарка автора удалена',
        type: 'success'
      });

      // Уведомляем родительский компонент об обновлении
      if (onAuthorUpdate) {
        onAuthorUpdate(updatedAuthor);
      }

      // Закрываем модальное окно через небольшую задержку
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Ошибка при удалении аватарки:', error);
      setNotification({
        message: error.response?.data?.message || 'Ошибка при удалении аватарки',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAvatarFile(null);
    setAvatarPreview(author?.avatarUrl || '');
    setNotification(null);
    onClose();
  };

  return (
    <div className="edit-avatar-modal-overlay" onClick={handleClose}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="edit-avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-avatar-modal-header">
          <h2 className="edit-avatar-modal-title">
            Редактировать аватарку автора
          </h2>
          <button 
            className="edit-avatar-modal-close" 
            onClick={handleClose}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="edit-avatar-modal-body">
          <div className="author-info">
            <div className="author-name">{author.authorName}</div>
            <div className="author-status">
              {author.isVerified ? 'Зарегистрированный автор' : 'Незарегистрированный автор'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-avatar-form">
            <div className="form-group">
              <label htmlFor="avatarFile" className="form-label">
                Загрузка аватарки
              </label>
              <input
                id="avatarFile"
                type="file"
                className="form-file-input"
                onChange={handleFileChange}
                accept="image/*"
                disabled={loading}
              />
              <div className="form-help">
                Выберите файл изображения (JPG, PNG, GIF) для загрузки в качестве аватарки автора
              </div>
            </div>

            {/* Предварительный просмотр */}
            <div className="avatar-preview">
              <div className="preview-label">Предварительный просмотр:</div>
              <div className="preview-container">
                <img
                  src={avatarPreview || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg=='}
                  alt="Предварительный просмотр аватара"
                  className="preview-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Сбросить
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRemoveAvatar}
                disabled={loading}
              >
                {loading ? 'Удаление...' : 'Удалить аватарку'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !avatarFile}
              >
                {loading ? 'Загрузка...' : 'Загрузить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAuthorAvatarModal; 