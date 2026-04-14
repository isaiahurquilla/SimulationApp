import react, { useState, useEffect, useMemo} from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView} from "react-native";

const FIRST_NAMES = [
  'Isaiah', 'Isaac', 'Noah', 'Emma', 'Olivia',
  'Leilani', 'Sophia', 'Elijah', 'Mia', 'Mateo',
];

const LAST_NAMES = [
  'Urquilla', 'Aguilar', 'Rodriguez', 'Taylor', 'Anderson',
  'Thomas', 'Jackson', 'Howard', 'Harris', 'Martin',
];

const INITIAL_STOCKS = [
  { id: 1, symbol: 'AAPL', value: 120, previous: 120 },
  { id: 2, symbol: 'MSFT', value: 95, previous: 95 },
  { id: 3, symbol: 'TSLA', value: 140, previous: 140 },
  { id: 4, symbol: 'AMZN', value: 110, previous: 110 },
  { id: 5, symbol: 'NVDA', value: 160, previous: 160 },
];

const INITIAL_PUMPS = [
  { id: 1, name: 'Pump 1', value: 20, direction: 1, total: 0, active: true },
  { id: 2, name: 'Pump 2', value: 45, direction: 1, total: 0, active: true },
  { id: 3, name: 'Pump 3', value: 70, direction: -1, total: 0, active: true },
  { id: 4, name: 'Pump 4', value: 90, direction: -1, total: 0, active: true },
];

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [paused, setPaused] = useState(false);

  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [nameCount, setNameCount] = useState('5');
  const [generatedNames, setGeneratedNames] = useState([]);
  const [nameHistory, setNameHistory] = useState([]);
  const [pumps, setPumps] = useState(INITIAL_PUMPS);

  useEffect(() => {
    if (paused) return;

    const stockTimer = setInterval(() => {
      setStocks((currentStocks) =>
        currentStocks.map((stock) => {
          const change = Math.floor(Math.random() * 21) - 10;
          let newValue = stock.value + change;

          if (newValue < 0) newValue = 0;
          if (newValue > 200) newValue = 200;

          return {
            ...stock,
            previous: stock.value,
            value: newValue,
          };
        })
      );
    }, 1500);

    return () => clearInterval(stockTimer);
  }, [paused]);

  useEffect(() => {
    if (paused) return;

    const pumpTimer = setInterval(() => {
      setPumps((currentPumps) =>
        currentPumps.map((pump) => {
          if (!pump.active) return pump;

          let newValue = pump.value + pump.direction * 5;
          let newDirection = pump.direction;

          if (newValue <= 0) {
            newValue = 0;
            newDirection = 1;
          } else if (newValue >= 100) {
            newValue = 100;
            newDirection = -1;
          }

          return {
            ...pump,
            value: newValue,
            direction: newDirection,
            total: pump.total + newValue,
          };
        })
      );
    }, 1000);

    return () => clearInterval(pumpTimer);
  }, [paused]);

  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => b.value - a.value);
  }, [stocks]);

  const topStock = sortedStocks[0];

  const stockAverage = useMemo(() => {
    const total = stocks.reduce((sum, stock) => sum + stock.value, 0);
    return stocks.length ? (total / stocks.length).toFixed(2) : '0.00';
  }, [stocks]);

  const totalPumpOutput = useMemo(() => {
    return pumps.reduce((sum, pump) => sum + pump.total, 0);
  }, [pumps]);

  const activePumpCount = useMemo(() => {
    return pumps.filter((pump) => pump.active).length;
  }, [pumps]);

  const generateNames = () => {
    const requestedCount = parseInt(nameCount, 10);

    if (isNaN(requestedCount) || requestedCount <= 0) return;

    const maxUnique = FIRST_NAMES.length * LAST_NAMES.length;
    const finalCount = Math.min(requestedCount, maxUnique);

    const used = new Set();
    const newNames = [];

    while (newNames.length < finalCount) {
      const first =
        FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const last =
        LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fullName = `${first} ${last}`;

      if (!used.has(fullName)) {
        used.add(fullName);
        newNames.push(fullName);
      }
    }

    setGeneratedNames(newNames);
    setNameHistory((prev) => [newNames, ...prev]);
  };

  const togglePump = (id) => {
    setPumps((currentPumps) =>
      currentPumps.map((pump) =>
        pump.id === id ? { ...pump, active: !pump.active } : pump
      )
    );
  };

  const resetAll = () => {
    setPaused(false);
    setStocks(INITIAL_STOCKS);
    setGeneratedNames([]);
    setNameHistory([]);
    setNameCount('5');
    setPumps(INITIAL_PUMPS);
    setScreen('dashboard');
  };

  const renderNavButton = (label, value) => (
    <TouchableOpacity
      key={value}
      style={[styles.navButton, screen === value && styles.activeNavButton]}
      onPress={() => setScreen(value)}
    >
      <Text style={styles.navButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lab 05 Simulation App</Text>

      <View style={styles.navRow}>
        {renderNavButton('Dashboard', 'dashboard')}
        {renderNavButton('Stocks', 'stocks')}
        {renderNavButton('Names', 'names')}
        {renderNavButton('Oil', 'oil')}
      </View>

      <View style={styles.globalControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setPaused((prev) => !prev)}
        >
          <Text style={styles.controlButtonText}>
            {paused ? 'Resume Systems' : 'Pause Systems'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
          <Text style={styles.controlButtonText}>Reset All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {screen === 'dashboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dashboard</Text>

            <View style={styles.card}>
              <Text style={styles.cardText}>Total Stocks: {stocks.length}</Text>
              <Text style={styles.cardText}>Average Stock Value: {stockAverage}</Text>
              <Text style={styles.cardText}>
                Highest Performing Stock: {topStock.symbol} ({topStock.value})
              </Text>
              <Text style={styles.cardText}>
                Total Pump Output: {totalPumpOutput}
              </Text>
              <Text style={styles.cardText}>
                Active Pumps: {activePumpCount}
              </Text>
              <Text style={styles.cardText}>
                Generated Names in Current Set: {generatedNames.length}
              </Text>
            </View>
          </View>
        )}

        {screen === 'stocks' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Ticker</Text>

            {sortedStocks.map((stock, index) => {
              const change = stock.value - stock.previous;
              const isTop = index === 0;

              return (
                <View
                  key={stock.id}
                  style={[styles.stockCard, isTop && styles.topStockCard]}
                >
                  <View style={styles.stockRow}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockValue}>{stock.value}</Text>
                  </View>

                  <Text
                    style={[
                      styles.stockChange,
                      change > 0
                        ? styles.positive
                        : change < 0
                        ? styles.negative
                        : styles.neutral,
                    ]}
                  >
                    Change: {change > 0 ? '+' : ''}{change}
                  </Text>

                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(stock.value / 200) * 100}%` },
                      ]}
                    />
                  </View>

                  {isTop && <Text style={styles.topPerformer}>Top Performer</Text>}
                </View>
              );
            })}
          </View>
        )}

        {screen === 'names' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Name Generator</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={nameCount}
              onChangeText={setNameCount}
              placeholder="Enter number of names"
            />

            <TouchableOpacity style={styles.controlButton} onPress={generateNames}>
              <Text style={styles.controlButtonText}>Generate Names</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.subTitle}>Current Results</Text>
              {generatedNames.length === 0 ? (
                <Text style={styles.cardText}>No names generated yet.</Text>
              ) : (
                generatedNames.map((name, index) => (
                  <Text key={`${name}-${index}`} style={styles.cardText}>
                    {index + 1}. {name}
                  </Text>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.subTitle}>History</Text>
              {nameHistory.length === 0 ? (
                <Text style={styles.cardText}>No history yet.</Text>
              ) : (
                nameHistory.map((group, index) => (
                  <View key={index} style={styles.historyBlock}>
                    <Text style={styles.historyTitle}>Generation {index + 1}</Text>
                    {group.map((name, i) => (
                      <Text key={`${name}-${i}`} style={styles.cardText}>
                        - {name}
                      </Text>
                    ))}
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {screen === 'oil' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oil Pump Monitor</Text>

            {pumps.map((pump) => (
              <View key={pump.id} style={styles.pumpCard}>
                <View style={styles.stockRow}>
                  <Text style={styles.stockSymbol}>{pump.name}</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      pump.active ? styles.activeToggle : styles.inactiveToggle,
                    ]}
                    onPress={() => togglePump(pump.id)}
                  >
                    <Text style={styles.toggleButtonText}>
                      {pump.active ? 'Active' : 'Off'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardText}>Current Value: {pump.value}</Text>
                <Text style={styles.cardText}>
                  Direction: {pump.direction === 1 ? 'Increasing' : 'Decreasing'}
                </Text>
                <Text style={styles.cardText}>Total Output: {pump.total}</Text>

                {pump.value >= 90 && (
                  <Text style={styles.alertText}>Alert: Near maximum threshold</Text>
                )}

                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pump.value}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingTop: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  navButton: {
    backgroundColor: '#d9e2ec',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    margin: 4,
  },
  activeNavButton: {
    backgroundColor: '#4c78ff',
  },
  navButtonText: {
    color: '#111',
    fontWeight: '600',
  },
  globalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  controlButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  resetButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 6,
  },
  stockCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  topStockCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockChange: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  neutral: {
    color: '#555',
  },
  barBackground: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  topPerformer: {
    marginTop: 8,
    color: '#15803d',
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  historyBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  pumpCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: '#16a34a',
  },
  inactiveToggle: {
    backgroundColor: '#6b7280',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  alertText: {
    color: '#b91c1c',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
});