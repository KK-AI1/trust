import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { registerJapaneseFont } from "@/lib/pdf-fonts";
import type { CastPayroll } from "@/lib/payroll";

registerJapaneseFont();

const WAGE_LABEL: Record<string, string> = {
  HOURLY: "時給",
  DAILY: "日給",
  MONTHLY: "月給",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 10,
    padding: 32,
    color: "#1a1a1a",
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 11,
    color: "#555555",
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  label: {
    color: "#555555",
  },
  value: {
    color: "#1a1a1a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#1a1a1a",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 18,
    color: "#b45309",
  },
});

export function PayrollSlipDocument({
  storeName,
  periodLabel,
  payroll,
}: {
  storeName: string;
  periodLabel: string;
  payroll: CastPayroll;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>給与明細書</Text>
        <Text style={styles.subtitle}>
          {storeName} / {periodLabel} / {payroll.castName} 様
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>給与形態</Text>
            <Text style={styles.value}>{WAGE_LABEL[payroll.wageType]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>出勤日数</Text>
            <Text style={styles.value}>{payroll.workedDays} 日</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>実働時間</Text>
            <Text style={styles.value}>{payroll.workedHours} 時間</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>基本給</Text>
            <Text style={styles.value}>
              ¥{payroll.wagePay.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>
              本指名 {payroll.honshimeiCount}件 / 場内指名 {payroll.jonaiCount}
              件 / 同伴 {payroll.dohanCount}件
            </Text>
            <Text style={styles.value}>
              ¥{payroll.nominationBackTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ボトルバック合計</Text>
            <Text style={styles.value}>
              ¥{payroll.bottleBackTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>支給合計(控除前)</Text>
            <Text style={styles.value}>
              ¥{payroll.grossBeforeWelfare.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              厚生費控除 ({(payroll.welfareRate * 100).toFixed(1)}%)
            </Text>
            <Text style={styles.value}>
              −¥{payroll.welfareDeduction.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>差引支給額</Text>
          <Text style={styles.totalValue}>
            ¥{payroll.netPay.toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
