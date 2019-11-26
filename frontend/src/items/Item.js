import React from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    minWidth: '25%',
    height: '95%',
    backgroundColor: 'rgb(255, 250, 227)'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const Item = (props) => {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.card} onClick={() => handleItemClick(props.item, props)}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {props.item.name}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Genre: {props.item.genre}
        </Typography>
        <Typography variant="body2" component="p">
          <br />
          {props.item.status}
        </Typography>
      </CardContent>
    </Card>
  );
}

let handleItemClick = (item, props) => {
  props.history.push({
    pathname: '/item',
    state: { item }
  })
}

export default withRouter(Item);
