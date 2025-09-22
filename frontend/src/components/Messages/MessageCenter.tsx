import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Badge,
  Divider,
  InputAdornment,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { messageAPI } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  messageType: string;
  sender: User;
  receiver: User;
  attachments: string[];
}

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

const MessageCenter: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await messageAPI.getMessages(userId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await messageAPI.searchUsers(searchQuery);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const response = await messageAPI.sendMessage({
        receiverId: selectedConversation,
        content: messageText.trim(),
        messageType: 'text'
      });

      setMessages(prev => [...prev, response.data.data]);
      setMessageText('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const startConversation = (user: User) => {
    setSelectedConversation(user.id);
    setSearchQuery('');
    setSearchResults([]);
    
    const existingConversation = conversations.find(conv => conv.user.id === user.id);
    if (!existingConversation) {
      const newConversation: Conversation = {
        user,
        lastMessage: {} as Message,
        unreadCount: 0
      };
      setConversations(prev => [newConversation, ...prev]);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' } = {
      super_user: 'primary',
      entrepreneur: 'success',
      ally: 'warning',
      client: 'secondary'
    };
    return colors[role] || 'primary';
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      super_user: 'Super Usuario',
      entrepreneur: 'Emprendedor',
      ally: 'Aliado',
      client: 'Cliente'
    };
    return labels[role] || role;
  };

  if (loading) {
    return <Typography>Cargando mensajes...</Typography>;
  }

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
      {/* Conversations List */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Resultados de búsqueda:
              </Typography>
              {searchResults.map((user) => (
                <Card key={user.id} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => startConversation(user)}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={user.profilePicture} sx={{ width: 32, height: 32 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{user.name}</Typography>
                        <Chip
                          label={getRoleLabel(user.role)}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Divider />
            </Box>
          )}

          {/* Conversations */}
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation.user.id}
                button
                selected={selectedConversation === conversation.user.id}
                onClick={() => setSelectedConversation(conversation.user.id)}
              >
                <ListItemAvatar>
                  <Badge badgeContent={conversation.unreadCount} color="primary">
                    <Avatar src={conversation.user.profilePicture}>
                      {conversation.user.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{conversation.user.name}</Typography>
                      <Chip
                        label={getRoleLabel(conversation.user.role)}
                        size="small"
                        color={getRoleColor(conversation.user.role)}
                      />
                    </Box>
                  }
                  secondary={
                    conversation.lastMessage.content && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conversation.lastMessage.content}
                      </Typography>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Messages */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {conversations.find(c => c.user.id === selectedConversation)?.user.name}
                </Typography>
              </Box>

              {/* Messages List */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                {messages.map((message, index) => {
                  const isOwn = message.sender.id !== selectedConversation;
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                  return (
                    <Box key={message.id}>
                      {showDate && (
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                          <Chip label={formatDate(message.createdAt)} size="small" />
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1,
                            maxWidth: '70%',
                            backgroundColor: isOwn ? 'primary.main' : 'grey.100',
                            color: isOwn ? 'white' : 'text.primary',
                          }}
                        >
                          <Typography variant="body2">{message.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              textAlign: 'right',
                              mt: 0.5,
                              opacity: 0.7,
                            }}
                          >
                            {formatTime(message.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={sendMessage} disabled={!messageText.trim()}>
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Selecciona una conversación para comenzar
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MessageCenter;