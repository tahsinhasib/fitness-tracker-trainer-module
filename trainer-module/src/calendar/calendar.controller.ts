// src/calendar/calendar.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { WorkoutPlanService } from '../workout-plan/workout-plan.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly workoutPlanService: WorkoutPlanService) {}

  @Get('client/:clientId')
  async getClientCalendar(@Param('clientId') clientId: number, @Res() res: Response) {
    const plans = await this.workoutPlanService.getPlansByClient(clientId);

    // Serve raw HTML directly with embedded JS
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Workout Plan Calendar</title>
        <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css" rel="stylesheet" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 2rem;
          }
          #calendar {
            max-width: 900px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <h1>Workout Plan Calendar (Client ID: ${clientId})</h1>
        <div id="calendar"></div>

        <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function () {
            const calendarEl = document.getElementById('calendar');
            const calendar = new FullCalendar.Calendar(calendarEl, {
              initialView: 'dayGridMonth',
              headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              },
              events: ${JSON.stringify(
                plans.map((plan) => ({
                  title: plan.title,
                  start: plan.startDate,
                  end: plan.endDate,
                  extendedProps: {
                    description: plan.description,
                    routine: plan.routine,
                  },
                }))
              )},
              eventClick: function(info) {
                const { title, extendedProps } = info.event;
                alert(\`📌 \${title}\\n\\n📝 \${extendedProps.description}\\n📅 Routine: \${extendedProps.routine}\`);
              }
            });

            calendar.render();
          });
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
