const { google } = require('googleapis');

class GoogleMeetService {
  constructor() {
    this.calendar = google.calendar('v3');
  }

  async createMeeting(meetingData, accessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      
      const event = {
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: meetingData.startTime,
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: 'America/Bogota'
        },
        attendees: meetingData.attendees || [],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await this.calendar.events.insert({
        auth,
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        googleEventId: response.data.id,
        meetLink: meetLink,
        eventData: response.data
      };
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      
      const fallbackMeetLink = `https://meet.google.com/new?authuser=0`;
      return {
        googleEventId: null,
        meetLink: fallbackMeetLink,
        eventData: null
      };
    }
  }

  async updateMeeting(eventId, updateData, accessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const response = await this.calendar.events.update({
        auth,
        calendarId: 'primary',
        eventId: eventId,
        resource: updateData
      });

      return response.data;
    } catch (error) {
      console.error('Error updating Google Meet:', error);
      throw error;
    }
  }

  async deleteMeeting(eventId, accessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      await this.calendar.events.delete({
        auth,
        calendarId: 'primary',
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Error deleting Google Meet:', error);
      throw error;
    }
  }

  generateInstantMeetLink() {
    return `https://meet.google.com/new?authuser=0`;
  }
}

module.exports = new GoogleMeetService();