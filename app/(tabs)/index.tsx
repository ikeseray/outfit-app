import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Action, Card, colors, Copy, Page, Pill } from '@/components/wardrobe-ui';

export default function Home() {
  const router = useRouter();
  return (
    <Page subtitle="上海 · 多云 · 演示数据">
      <Card tinted>
        <Copy muted>今日天气</Copy>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text selectable style={{ fontSize: 48, color: colors.ink }}>22°</Text>
          <Text accessibilityLabel="多云" style={{ fontSize: 44, color: colors.ink }}>☁</Text>
        </View>
        <Copy muted>体感 20° · 降雨 20%</Copy>
      </Card>
      <Card>
        <Copy muted>今日场景</Copy>
        <Copy large>上班</Copy>
        <Pill>需要正式一些</Pill>
      </Card>
      <Card>
        <Copy muted>今日穿搭</Copy>
        <Copy large>白衬衫 + 直筒长裤</Copy>
        <Action label="去搭配看看" onPress={() => router.push('/weekly')} />
      </Card>
      <Copy muted>先试试你的穿搭助手。当前天气和衣物为示例，尚未连接真实天气或 AI 服务。</Copy>
    </Page>
  );
}
