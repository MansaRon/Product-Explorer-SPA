import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  type ChartData,
} from 'chart.js';
import { SalesByDay } from '../../../../core/models/admin-stats';

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip);

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesChartComponent implements OnDestroy {
  readonly data = input.required<SalesByDay[]>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly injector = inject(Injector);
  private chart: Chart | null = null;

  constructor() {
    afterNextRender(() => {
      this.chart = new Chart(this.canvasRef().nativeElement, {
        type: 'bar',
        data: this.buildChartData(this.data()),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, maxRotation: 45 },
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 11 },
                callback: (v) => `R${Number(v).toLocaleString()}`,
              },
            },
          },
        },
      });

      effect(
        () => {
          const d = this.data();
          if (!this.chart) return;
          const updated = this.buildChartData(d);
          this.chart.data.labels = updated.labels;
          this.chart.data.datasets[0].data = updated.datasets[0].data;
          this.chart.update('none');
        },
        { injector: this.injector }
      );
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChartData(days: SalesByDay[]): ChartData<'bar'> {
    return {
      labels: days.map((d) => this.formatDate(d.date)),
      datasets: [
        {
          data: days.map((d) => d.revenue),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }

  private formatDate(iso: string): string {
    const [, m, d] = iso.split('-');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[Number(m) - 1]} ${Number(d)}`;
  }
}
