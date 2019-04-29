function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">PagerD Settings</Text>}>
        <TextInput label="API Token" settingsKey="apiToken" placeholder="API Token from PagerDuty"></TextInput>
        <TextInput label="Team id" settingsKey="teamId" placeholder="Team id from PagerDuty"></TextInput>
        <TextInput label="Email" settingsKey="email" placeholder="Email for actions on PD"></TextInput>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
