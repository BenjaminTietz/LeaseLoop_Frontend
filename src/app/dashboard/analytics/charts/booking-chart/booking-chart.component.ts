import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import { ClickOutsideDirective } from '../../../../directives/outside-click/click-outside.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

interface UnitData {
  name?: string;
  confirmed?: number;
  total?: number;
}

interface PropertyData {
  name?: string;
  units: Record<string, UnitData>;
}

interface SlicePath {
  type: 'path';
  d: string;
  color: string;
  label: string;
  value: number;
  percent: string;
  textPos: { x: number; y: number } | null;
}

interface SliceCircle {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
  color: string;
  label: string;
  value: number;
  percent: string;
  textPos: { x: number; y: number } | null;
}

type Slice = SlicePath | SliceCircle;

@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    ClickOutsideDirective,
    MatTooltipModule,
  ],
  templateUrl: './booking-chart.component.html',
  styleUrl: './booking-chart.component.scss',
})
export class BookingChartComponent {
  analyticsService = inject(AnalyticsService);
  rawData = computed(() => this.analyticsService.bookingData() as any);
  data = computed(() => {
    const raw = this.rawData();
    return (raw?.properties as Record<string, PropertyData>) ?? {};
  });

  clickOutside = () => this.selectedLabel.set(null);
  selectedLabel = signal<string | null>(null);

  /**
   * Retrieves booking data for the given date range on component initialization.
   * @internal
   */
  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    this.analyticsService.getBookingData(from, to);
  }

  /**
   * Generates an array of colors with a spectrum of hues. The colors will have
   * the same saturation and lightness, but will have a range of hues from 0 to
   * 360 degrees, divided into the given count of segments.
   * @param count The number of colors to generate. Must be a positive integer.
   * @returns An array of strings, each representing a color in the HSL format.
   */
  generateSpectrumColors(count: number): string[] {
    const colors: string[] = [];
    const saturation = 70;
    const lightness = 50;
    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  }

  colors = computed(() => {
    const data = this.chartData();
    return this.generateSpectrumColors(data.length);
  });

  total = computed(() => {
    const properties = this.data();
    let total = 0;
    for (const prop of Object.values(properties)) {
      for (const unit of Object.values(prop.units)) {
        total += unit.confirmed ?? unit.total ?? 0;
      }
    }

    return total;
  });

  chartData = computed(() => {
    const properties = this.data();
    const result: { label: string; value: number }[] = [];
    for (const propId in properties) {
      const prop = properties[propId];
      const propName = prop.name ?? `Property ${propId}`;
      for (const unitId in prop.units) {
        const unit = prop.units[unitId];
        const unitName = unit.name ?? `Unit ${unitId}`;
        const value = unit.confirmed ?? unit.total ?? 0;
        result.push({ label: `${propName} - ${unitName}`, value });
      }
    }
    return result;
  });

  slices = computed<Slice[]>(() => {
    const total = this.total();
    const data = [...this.chartData()].sort((a, b) => a.value - b.value);
    const centerX = 120;
    const centerY = 120;
    const radius = 100;
    if (data.length === 1) {
      const item = data[0];
      return [
        {
          type: 'circle',
          cx: centerX,
          cy: centerY,
          r: radius,
          color: this.colors()[0],
          label: item.label,
          value: item.value,
          percent: '100.0',
          textPos: { x: centerX, y: centerY },
        },
      ];
    }
    let startAngle = 0;

    return data.map((item, index) => {
      const value = item.value;
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;
      const largeArc = angle > 180 ? 1 : 0;
      const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);
      const d = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const midAngle = startAngle + angle / 2;
      const labelRadius = 85;
      const textX =
        centerX + labelRadius * Math.cos((Math.PI * midAngle) / 180);
      const textY =
        centerY + labelRadius * Math.sin((Math.PI * midAngle) / 180);
      const percent = ((value / total) * 100).toFixed(1);
      const percentValue = parseFloat(percent);
      const showText = percentValue >= 3;
      startAngle = endAngle;
      return {
        type: 'path',
        d,
        color: this.colors()[index],
        label: item.label,
        value: item.value,
        percent,
        textPos: showText ? { x: textX, y: textY } : null,
      };
    });
  });

  hoveredSlice = signal<number | null>(null);

  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  /**
   * Sets the hovered slice index and shows the tooltip at the given
   * coordinates with the given label and value.
   * @param index The index of the hovered slice.
   * @param event The mouse event that triggered the hover.
   * @param label The label of the hovered slice.
   * @param value The value of the hovered slice.
   */
  onSliceEnter(index: number, event: MouseEvent, label: string, value: number) {
    this.hoveredSlice.set(index);
    this.tooltip.set({
      x: event.clientX,
      y: event.clientY,
      label,
      value,
    });
  }

  /**
   * Resets the hovered slice index and hides the tooltip.
   */
  onSliceLeave() {
    this.hoveredSlice.set(null);
    this.tooltip.set(null);
  }

  /**
   * Toggles the selection of a slice by its label.
   * If the slice is already selected, it deselects it;
   * otherwise, it selects the slice with the given label.
   *
   * @param label The label of the slice to be toggled.
   */
  selectSlice(label: string) {
    this.selectedLabel.set(this.selectedLabel() === label ? null : label);
  }
}
