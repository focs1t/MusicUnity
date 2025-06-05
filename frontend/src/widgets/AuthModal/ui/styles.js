// Общие стили для модальных окон аутентификации
export const modalStyles = {
  paper: {
    borderRadius: 2,
    bgcolor: '#121212',
    color: 'white',
    boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    position: 'relative',
    backgroundImage: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  dialogContent: { 
    px: 4, 
    py: 5 
  },
  closeButton: { 
    position: 'absolute', 
    right: 12, 
    top: 12, 
    zIndex: 10,
    cursor: 'pointer',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.1)'
    }
  },
  title: { 
    textAlign: 'center', 
    mb: 4, 
    fontWeight: 600, 
    color: '#fff',
    textShadow: '0px 2px 4px rgba(0,0,0,0.3)'
  },
  textField: {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&.Mui-focused fieldset': { borderColor: '#333' },
      '&.Mui-error fieldset': { borderColor: '#bf616a' },
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      // Стили для автозаполнения полей ввода
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px rgba(50, 50, 50, 0.8) inset !important',
        WebkitTextFillColor: 'white !important',
        caretColor: 'white',
        borderRadius: 'inherit',
        transition: 'background-color 5000s ease-in-out 0s'
      },
      '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 100px rgba(60, 60, 60, 0.8) inset !important'
      }
    },
    '& .MuiInputBase-input': { 
      color: 'white',
      padding: '14px 16px',
    },
    '& .MuiFormLabel-root': {
      color: 'rgba(255,255,255,0.6)',
      '&.Mui-focused': {
        color: 'white'
      }
    },
    '& .MuiFormLabel-asterisk': {
      color: '#bf616a'
    }
  },
  inputLabel: { 
    color: 'rgba(255,255,255,0.6)'
  },
  helperText: { 
    color: '#bf616a' 
  },
  button: { 
    mt: 3, 
    mb: 3, 
    py: 1.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#000',
    '&:hover': {
      backgroundColor: 'white'
    },
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 1.5,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  linkText: { 
    cursor: 'pointer', 
    ml: 1,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    transition: 'color 0.2s',
    '&:hover': { 
      color: 'white', 
      textDecoration: 'underline' 
    }
  },
  secondaryLinkText: {
    cursor: 'pointer', 
    color: 'rgba(255,255,255,0.8)',
    transition: 'color 0.2s',
    '&:hover': { 
      color: 'white', 
      textDecoration: 'underline' 
    }
  },
  checkbox: { 
    color: 'rgba(255,255,255,0.5)', 
    '&.Mui-checked': { 
      color: 'white' 
    } 
  },
  errorText: { 
    mt: 2.5, 
    mb: 1, 
    textAlign: 'center', 
    color: '#bf616a',
    bgcolor: 'rgba(191,97,106,0.1)',
    borderRadius: 1,
    py: 1,
    px: 2
  },
  successAlert: { 
    mb: 3, 
    bgcolor: 'rgba(56, 142, 60, 0.15)', 
    color: '#66bb6a',
    borderRadius: 1.5,
    '& .MuiAlert-icon': {
      color: '#66bb6a'
    }
  },
  flexCenter: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  normalText: { 
    color: 'rgba(255,255,255,0.7)' 
  }
}; 