import { useEffect, useState } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'

import { TextField, Autocomplete } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

const FieldPlugin = () => {
  const {
    data,
    actions: { setContent },
  } = useFieldPlugin()

  const [folders, setFolders] = useState([])
  const [selectOpen, setSelectOpen] = useState(false)

  // Intial content of the plugin
  const isArrayOfStrings = (value) =>
    Array.isArray(value) && value.every((it) => typeof it === 'string')
  const inital_value = isArrayOfStrings(data.content) ? data.content : []

  // Extracting starts_with from options
  const starts_with = data.options.starts_with ?? ''

  useEffect(() => {
    // Get folders and filter according to starts_with
    const getFoldersAndFilter = async () => {
      // Using space token
      const token = data.token
      // Fetch all links
      let response = await fetch(
        `https://api.storyblok.com/v2/cdn/links/?token=${token}&starts_with=${starts_with}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )

      const all_links = await response.json()

      // Map Folders
      let filteredFolders = Object.values(all_links.links)
        .filter((l) => l.is_folder)
        .map((f) =>
          // Storing id, name, slug, uuid
          ({
            id: f.id,
            name: f.name,
            slug: f.slug,
            uuid: f.uuid,
          }),
        )

      setFolders(() => filteredFolders)
      setContent(() =>
        filteredFolders.filter((f) => inital_value.some((c) => c.id === f.id)),
      )
    }
    getFoldersAndFilter()
  }, [])

  return (
    <Autocomplete
      sx={{ minWidth: 120, minHeight: selectOpen ? 250 : 0 }}
      multiple
      options={folders}
      getOptionLabel={(folder) => folder.name}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Select Folders"
        />
      )}
      onOpen={() => setSelectOpen(true)}
      onClose={() => setSelectOpen(false)}
      onChange={(event, value) => setContent(value)}
      renderOption={(props, option, { selected }) => (
        <MenuItem
          {...props}
          divider
          key={option.id}
          value={option}
          sx={{ justifyContent: 'space-between' }}
          disabled={
            Number(data.options.maximum)
              ? data.content.length >= Number(data.options.maximum) && !selected
              : false
          }
        >
          <Checkbox checked={selected} />
          <ListItemText
            primary={option.name}
            secondary={option.slug}
          />
        </MenuItem>
      )}
    />
  )
}

export default FieldPlugin
